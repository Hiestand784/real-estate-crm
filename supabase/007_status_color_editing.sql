-- 007: status, calendar color, one-row-per-kind key dates, editing
-- Run in the Supabase SQL Editor of the DEV project, after 006 has run.

-- 1. Status and color ---------------------------------------------------------
-- The default fills existing dev rows. create_transaction() below also sets it,
-- because jsonb_populate_record() ignores column defaults (missing keys = null).
alter table transactions
  add column status text not null default 'active'
    check (status in ('active', 'closed')),
  add column color text
    check (color in ('blue', 'teal', 'green', 'purple', 'pink', 'orange', 'brown', 'gray'));

-- 2. One key date per kind per transaction ('other' may repeat) ---------------
-- Editing relies on this to update a date in place instead of adding a copy.
-- If this fails, dev data has a duplicate: find it with
--   select transaction_id, kind, count(*) from key_dates group by 1, 2 having count(*) > 1;
create unique index key_dates_one_per_kind
  on key_dates (transaction_id, kind)
  where kind <> 'other';

-- 3. create_transaction(), version 3: new deals start active --------------------
-- Order matters with ||: the right side wins. Defaults first, then the form's
-- data, then the server-controlled values the form must never override.
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
    jsonb_build_object('status', 'active')
      || (payload->'transaction')
      || jsonb_build_object(
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

-- 4. update_transaction(): all-or-nothing edit ---------------------------------
-- Payload: { transaction: { column: value, ... }, key_dates: [ {kind, due_date, due_time?} ] }
--
-- Only the columns the form sends are changed, so the form must send every
-- column field on this side, with hidden ones as null (that clears stale
-- values like loan_type after switching to cash). Columns it never sends,
-- like status, are left alone.
--
-- The UPDATE is built from the payload's keys. %I quotes each key as a
-- column name, so a key can't inject SQL; an unknown key makes r.<key> fail
-- and nothing is saved.
create or replace function public.update_transaction(p_id uuid, payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  -- Keys the form may never change. side is locked after creation.
  v_fields jsonb := coalesce(payload->'transaction', '{}'::jsonb)
                    - array['id', 'owner_id', 'client_id', 'created_at', 'side'];
  v_dates  jsonb := coalesce(payload->'key_dates', '[]'::jsonb);
  v_set    text;
  v_count  integer;
begin
  select string_agg(format('%I = r.%I', k, k), ', ')
    into v_set
    from jsonb_object_keys(v_fields) as k;

  if v_set is null then
    raise exception 'update_transaction: no fields sent';
  end if;

  execute format(
    'update transactions t set %s
       from jsonb_populate_record(null::transactions, $1) r
      where t.id = $2',
    v_set
  ) using v_fields, p_id;

  -- EXECUTE does not set FOUND, so check the row count instead. Zero rows means
  -- the id doesn't exist or row-level security hid it (not hers): stop here,
  -- before any key dates get attached to it.
  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'update_transaction: transaction not found';
  end if;

  -- Dates the form left blank are removed. 'other' rows aren't on the form,
  -- so they're left alone. The "is not null" guard matters: NOT IN against a
  -- list containing a null matches nothing, which would silently skip deletes.
  delete from key_dates
   where transaction_id = p_id
     and kind <> 'other'
     and kind not in (
       select d->>'kind' from jsonb_array_elements(v_dates) d
        where d->>'kind' is not null
     );

  -- Add new dates; update existing ones in place, which keeps their id.
  -- If a date moves, its "done" check is cleared, since it's a new deadline.
  insert into key_dates (transaction_id, kind, due_date, due_time)
  select p_id, d->>'kind', (d->>'due_date')::date, (d->>'due_time')::time
    from jsonb_array_elements(v_dates) d
  on conflict (transaction_id, kind) where kind <> 'other'
  do update set
    due_date     = excluded.due_date,
    due_time     = excluded.due_time,
    completed_at = case
                     when key_dates.due_date is distinct from excluded.due_date then null
                     else key_dates.completed_at
                   end;
end;
$$;

revoke all on function public.update_transaction(uuid, jsonb) from public, anon;
grant execute on function public.update_transaction(uuid, jsonb) to authenticated;