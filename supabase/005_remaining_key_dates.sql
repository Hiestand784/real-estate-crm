-- 005: remaining key dates (slice B)
-- Run in the Supabase SQL Editor of the DEV project, after 004 has run.
--
-- Migration 002 already allowed most of slice B's date types (buyer agency
-- start, listing contract start, list date, pending date, offer expiration,
-- HOA due) and added the due_time column. The only type still missing is
-- the purchase agreement's creation date, so this rebuilds the list with it.
--
-- create_transaction() does not need changing: it already saves due_time.

alter table key_dates drop constraint key_dates_kind_check;
alter table key_dates add constraint key_dates_kind_check check (kind in (
  'buyer_agency_start',
  'buyer_agency_end',
  'listing_contract_start',
  'listing_contract_expires',
  'list_date',
  'purchase_agreement_created',
  'pending_date',
  'emd_deadline',
  'inspection_deadline',
  'financing_deadline',
  'appraisal_deadline',
  'offer_expiration',
  'walkthrough',
  'closing',
  'hoa_due',
  'buying_anniversary',
  'other'
));