-- 004: drop status, items included/excluded checkboxes, other party information
-- Run in the Supabase SQL Editor of the DEV project, after 003 has run.
--
-- create_transaction() does not need changing: it fills whatever columns the
-- form sends (jsonb_populate_record), so new columns just work.

-- 1. Status is not needed. Its check constraint is dropped along with it.
alter table transactions drop column status;

-- 2. The old free-text "items included" column becomes the "other items" box.
--    (A rename has to be its own statement in Postgres.)
alter table transactions rename column items_included to items_included_other;

alter table transactions
  -- Items included. Every column stays null unless its box is checked.
  -- Simple items are true-or-null: check (x) rejects false, allows true and null.
  add column incl_refrigerator boolean check (incl_refrigerator),
  add column incl_dishwasher   boolean check (incl_dishwasher),
  add column incl_microwave    boolean check (incl_microwave),
  -- Items with a type: 'included' means checked but the type wasn't picked.
  add column incl_oven           text check (incl_oven           in ('included', 'gas', 'electric')),
  add column incl_water_heater   text check (incl_water_heater   in ('included', 'gas', 'electric')),
  add column incl_furnace        text check (incl_furnace        in ('included', 'gas', 'electric')),
  add column incl_water_softener text check (incl_water_softener in ('included', 'owned', 'rented')),
  add column items_excluded text,

  -- Other party information
  add column other_agent_name    text,
  add column other_agent_license text,
  add column other_agent_company text,
  add column other_agent_email   text,
  add column other_party_name  text, -- the seller when her client buys, the buyer when her client sells
  add column other_party_phone text,
  add column other_party_email text,
  add column lender_name  text,
  add column lender_email text,
  add column lender_phone text,
  add column title_company text,
  add column title_company_chosen_by text check (title_company_chosen_by in ('buyer', 'seller')),
  add column earnest_money_holder text check (earnest_money_holder in ('self', 'other_agent', 'title_company'));

-- Lender info only applies when her client is the buyer (the form hides it otherwise).
alter table transactions
  add constraint lender_only_for_buyer_side
    check (side = 'buyer' or (lender_name is null and lender_email is null and lender_phone is null));
