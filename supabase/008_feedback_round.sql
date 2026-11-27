-- 008: client feedback round (Nov 27)
-- Run in the Supabase SQL Editor of the DEV project, after 007 has run.
--
-- The SQL Editor sends this whole file as one request, which Postgres runs as
-- one transaction: if any statement fails, nothing in the file is applied.
--
-- create_transaction() and update_transaction() don't change: they fill
-- whatever columns the form sends, and the form stops sending the dropped ones.

-- 1. Earnest money holder stores the role, not "me" vs "them" -----------------
-- 'self' meant different people depending on the side; a role doesn't.
-- Her side's broker: selling broker when she represents the buyer,
-- listing broker when she represents the seller.
alter table transactions drop constraint transactions_earnest_money_holder_check;

update transactions
   set earnest_money_holder = case
         when earnest_money_holder = 'self'        and side = 'buyer'  then 'selling_broker'
         when earnest_money_holder = 'self'        and side = 'seller' then 'listing_broker'
         when earnest_money_holder = 'other_agent' and side = 'buyer'  then 'listing_broker'
         when earnest_money_holder = 'other_agent' and side = 'seller' then 'selling_broker'
       end
 where earnest_money_holder in ('self', 'other_agent');

alter table transactions
  add constraint transactions_earnest_money_holder_check
    check (earnest_money_holder in ('listing_broker', 'selling_broker', 'title_company'));

-- 2. "Century lock" was really a SentriLock ----------------------------------
alter table transactions drop constraint transactions_lockbox_type_check;

update transactions set lockbox_type = 'sentrilock' where lockbox_type = 'century_lock';

alter table transactions
  add constraint transactions_lockbox_type_check
    check (lockbox_type in ('sentrilock', 'combination_lock'));

-- 3. Listing broker commission is seller side only ---------------------------
update transactions set seller_commission_rate = null where side = 'buyer';

alter table transactions
  add constraint seller_commission_only_for_seller_side
    check (side = 'seller' or seller_commission_rate is null);

-- 4. Document tracker ---------------------------------------------------------
-- These two constraints mention columns dropped below. Postgres would drop
-- them silently along with the columns; dropping them here makes it visible.
alter table transactions
  drop constraint buyer_docs_only_for_buyer_side,
  drop constraint seller_docs_only_for_seller_side;

-- Each seller document becomes one checkbox. Keep "on file" and carry over
-- any "signed" check so nothing she ticked is lost.
update transactions
   set doc_sellers_disclosure_on_file = true
 where doc_sellers_disclosure_signed;

update transactions
   set doc_lead_paint_on_file = true
 where doc_lead_paint_signed;

alter table transactions
  drop column doc_buyer_agency_on_file,       -- its dates now sit in the tracker
  drop column doc_listing_contract_on_file,   -- entering its dates shows she has it
  drop column doc_purchase_agreement_on_file, -- same
  drop column doc_sellers_disclosure_signed,
  drop column doc_lead_paint_signed;

-- Home insurance: was a yes/no answer, now a true-or-null checkbox like the
-- other tracker items. A saved "No" becomes unchecked.
update transactions set home_insurance_in = null where home_insurance_in = false;
update transactions set home_insurance_in = null where side = 'seller';

alter table transactions
  add constraint home_insurance_true_or_null check (home_insurance_in),
  add constraint buyer_docs_only_for_buyer_side
    check (side = 'buyer' or home_insurance_in is null),
  add constraint seller_docs_only_for_seller_side
    check (side = 'seller' or (
      doc_sellers_disclosure_on_file is null
      and doc_lead_paint_on_file is null
      and doc_disclosure_of_interests_on_file is null
    ));