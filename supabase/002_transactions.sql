-- 002: transactions + first "new transaction" form support
-- Run in the Supabase SQL Editor of the DEV project. Dev data only.
-- Commit this file to the repo only after it runs without errors.
--
-- What this does:
--   1. Renames "cases" to "transactions" (and the case_id columns that point at it)
--   2. Adds the transaction fields the first form needs, including buyer/seller side
--   3. Adds a due_time column and the new key date types from the field list
--   4. Adds create_transaction(): saves client + transaction + key dates all-or-nothing
--
-- Renaming keeps existing grants, RLS policies, and the MFA policies working.

-- 1. Rename ------------------------------------------------------------------
alter table cases rename to transactions;
alter table key_dates rename column case_id to transaction_id;
alter table documents rename column case_id to transaction_id;
alter table notes     rename column case_id to transaction_id;

alter index cases_client_idx    rename to transactions_client_idx;
alter index key_dates_case_idx  rename to key_dates_transaction_idx;
alter index documents_case_idx  rename to documents_transaction_idx;

-- 2. New transaction fields --------------------------------------------------
alter table transactions
  add column side text not null default 'buyer' check (side in ('buyer', 'seller')),
  add column list_price numeric(12, 2) check (list_price >= 0),
  add column sale_price numeric(12, 2) check (sale_price >= 0),
  add column earnest_money_amount numeric(12, 2) check (earnest_money_amount >= 0),
  add column general_notes text;

-- The default was only there so existing dev rows could get a value.
-- New rows must always state their side explicitly.
alter table transactions alter column side drop default;

-- 3. Key dates: optional time of day, and the expanded list of types -----------
alter table key_dates add column due_time time;   -- e.g. offer expiration at 5:00 PM

alter table key_dates drop constraint key_dates_kind_check;
alter table key_dates add constraint key_dates_kind_check check (kind in (
  'buyer_agency_start',
  'buyer_agency_end',
  'listing_contract_start',
  'listing_contract_expires',
  'list_date',
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

-- 4. create_transaction(): one all-or-nothing save --------------------------------
-- A function runs as a single database transaction, so if any step fails
-- (for example a bad date), nothing is saved. No half-created deals.
-- security invoker = it runs with the CALLER's permissions, so row-level
-- security (including the MFA rule) still applies. owner_id fills itself in.
create or replace function public.create_transaction(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_client_id uuid;
  v_transaction_id uuid;
  v_date jsonb;
begin
  if payload->>'client_id' is not null then
    v_client_id := (payload->>'client_id')::uuid;
  else
    insert into clients (full_name, email, phone, kind)
    values (
      payload->'new_client'->>'full_name',
      nullif(payload->'new_client'->>'email', ''),
      nullif(payload->'new_client'->>'phone', ''),
      payload->>'side'
    )
    returning id into v_client_id;
  end if;

  insert into transactions (
    client_id, side, property_address, status,
    list_price, sale_price, earnest_money_amount, general_notes
  )
  values (
    v_client_id,
    payload->>'side',
    payload->>'property_address',
    coalesce(payload->>'status', 'prospect'),
    (payload->>'list_price')::numeric,
    (payload->>'sale_price')::numeric,
    (payload->>'earnest_money_amount')::numeric,
    nullif(payload->>'general_notes', '')
  )
  returning id into v_transaction_id;

  for v_date in
    select value from jsonb_array_elements(coalesce(payload->'key_dates', '[]'::jsonb))
  loop
    insert into key_dates (transaction_id, kind, due_date, due_time)
    values (
      v_transaction_id,
      v_date->>'kind',
      (v_date->>'due_date')::date,
      (v_date->>'due_time')::time
    );
  end loop;

  return v_transaction_id;
end;
$$;

-- Functions are executable by everyone by default, and this project does not
-- auto-expose new functions. Be explicit: logged-in users only.
revoke all on function public.create_transaction(jsonb) from public, anon;
grant execute on function public.create_transaction(jsonb) to authenticated;
