-- 003: property (section 3) and transaction terms (section 4) fields
-- Run in the Supabase SQL Editor of the DEV project, after 002 has run.
-- Commit this file to the repo only after it runs without errors.
--
-- Yes/no columns are nullable booleans on purpose:
--   null  = not answered yet, true = yes, false = no.
-- Check constraints are only used where the options are certain. The two
-- "who pays" columns have none yet, because the option lists still need her OK.

alter table transactions
  -- Property
  add column township text,
  add column county text,
  add column zip_code text,
  add column parcel_id text,
  add column legal_description text,
  add column items_included text,
  add column mls_number text,
  add column blc_number text,
  add column year_built integer check (year_built between 1600 and 2100),
  add column square_feet integer check (square_feet > 0),
  add column annual_tax numeric(12, 2) check (annual_tax >= 0),
  add column lockbox_type text check (lockbox_type in ('century_lock', 'combination_lock')),
  add column has_hoa boolean,
  add column hoa_bylaws_on_hand boolean,
  -- Pricing and commission (list_price, sale_price, earnest_money_amount already exist)
  add column seller_concessions_type text check (seller_concessions_type in ('percent', 'amount')),
  add column seller_concessions_value numeric(12, 2) check (seller_concessions_value >= 0),
  add column seller_commission_rate numeric(5, 3) check (seller_commission_rate between 0 and 100),
  add column buyer_commission_rate numeric(5, 3) check (buyer_commission_rate between 0 and 100),
  add column commission_payer text,
  -- Contract terms
  add column payment_method text check (payment_method in (
    'cash', 'new_mortgage', 'assumption', 'conditional_sales_contract', 'other'
  )),
  add column loan_type text check (loan_type in (
    'conventional', 'insured_conventional', 'fha', 'va', 'usda'
  )),
  add column home_warranty boolean,
  add column home_warranty_payer text,
  add column home_insurance_in boolean,
  add column sold_as_is boolean,
  add column possession text check (possession in ('pre', 'at', 'post')),
  add column survey_waived boolean,
  add column referral boolean;

-- Rules that span two columns
alter table transactions
  add constraint concessions_type_and_value_together
    check ((seller_concessions_type is null) = (seller_concessions_value is null)),
  add constraint loan_type_needs_new_mortgage
    check (loan_type is null or payment_method = 'new_mortgage');

-- create_transaction(), version 2.
-- The form now sends everything for the transaction as one JSON object, and
-- Postgres fills the matching columns itself (jsonb_populate_record). Adding a
-- column later no longer means editing this function.
--
-- Payload shape:
--   { client_id | new_client: {full_name, email, phone},
--     transaction: { side, property_address, ... any transactions column },
--     key_dates: [ {kind, due_date, due_time?} ] }
--
-- The server-controlled values (id, owner, client, created_at) are added AFTER
-- the form's data, so the form cannot override them. Row-level security still
-- checks every insert as well.
create or replace function public.create_transaction(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_client_id uuid;
  v_transaction_id uuid := gen_random_uuid();
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
      payload->'transaction'->>'side'
    )
    returning id into v_client_id;
  end if;

  insert into transactions
  select * from jsonb_populate_record(
    null::transactions,
    (payload->'transaction') || jsonb_build_object(
      'id', v_transaction_id,
      'owner_id', auth.uid(),
      'client_id', v_client_id,
      'created_at', now()
    )
  );

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

revoke all on function public.create_transaction(jsonb) from public, anon;
grant execute on function public.create_transaction(jsonb) to authenticated;
