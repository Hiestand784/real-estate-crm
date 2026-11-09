-- 006: document tracker statuses (slice D)
-- Run in the Supabase SQL Editor of the DEV project, after 005 has run.
--
-- Status only for now. When file storage comes, the files go in the documents
-- table and these columns stay as the checklist.
--
-- Every column is true-or-null, like the items-included boxes:
-- check (x) rejects false, allows true and null. Unchecked = null.
--
-- HOA bylaws on hand already exists (migration 003). It only moves to the
-- Document tracker section on the form, so it isn't touched here.
--
-- create_transaction() does not need changing: it fills whatever columns the
-- form sends (jsonb_populate_record), so new columns just work.

alter table transactions
  add column doc_buyer_agency_on_file          boolean check (doc_buyer_agency_on_file),
  add column doc_listing_contract_on_file      boolean check (doc_listing_contract_on_file),
  add column doc_sellers_disclosure_signed     boolean check (doc_sellers_disclosure_signed),
  add column doc_sellers_disclosure_on_file    boolean check (doc_sellers_disclosure_on_file),
  add column doc_lead_paint_signed             boolean check (doc_lead_paint_signed),
  add column doc_lead_paint_on_file            boolean check (doc_lead_paint_on_file),
  add column doc_disclosure_of_interests_on_file boolean check (doc_disclosure_of_interests_on_file),
  add column doc_purchase_agreement_on_file    boolean check (doc_purchase_agreement_on_file);

-- Same idea as lender_only_for_buyer_side in 004: the form hides these for the
-- other side, and the database refuses them too.
alter table transactions
  add constraint buyer_docs_only_for_buyer_side
    check (side = 'buyer' or doc_buyer_agency_on_file is null),
  add constraint seller_docs_only_for_seller_side
    check (side = 'seller' or (
      doc_listing_contract_on_file is null
      and doc_sellers_disclosure_signed is null
      and doc_sellers_disclosure_on_file is null
      and doc_lead_paint_signed is null
      and doc_lead_paint_on_file is null
      and doc_disclosure_of_interests_on_file is null
    ));