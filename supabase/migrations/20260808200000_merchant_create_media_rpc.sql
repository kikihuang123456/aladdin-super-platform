-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Part 29-14E
-- Create Merchant Media RPC Extension
-- ============================================================

begin;

create or replace function public.create_merchant(
  p_name text,
  p_legal_name text default null,
  p_merchant_type text default 'individual',
  p_market text default 'taiwan',
  p_contact_name text default null,
  p_contact_phone text default null,
  p_contact_email text default null,
  p_business_license_no text default null,
  p_tax_no text default null,
  p_address text default null,
  p_logo_url text default null,
  p_description text default null,
  p_cover_image_url text default null,
  p_website_url text default null
)
returns public.merchants
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_name text;
  v_merchant_no text;
  v_merchant public.merchants;
begin
  if auth.uid() is null then
    raise exception '使用者尚未登入。';
  end if;

  perform public.assert_current_user_permission(
    'merchant.create'
  );

  v_name := nullif(
    btrim(p_name),
    ''
  );

  if v_name is null then
    raise exception '商家名稱不可空白。';
  end if;

  -- MER + timestamp-derived suffix + random suffix
  v_merchant_no :=
    'MER'
    || to_char(
      clock_timestamp(),
      'YYYYMMDDHH24MISSMS'
    )
    || upper(
      substr(
        md5(
          random()::text
          || clock_timestamp()::text
        ),
        1,
        6
      )
    );

  insert into public.merchants (
    merchant_no,
    name,
    legal_name,
    merchant_type,
    market,
    contact_name,
    contact_phone,
    contact_email,
    business_license_no,
    tax_no,
    address,
    logo_url,
    cover_image_url,
    website_url,
    description,
    status,
    created_at,
    updated_at
  )
  values (
    v_merchant_no,
    v_name,
    nullif(btrim(p_legal_name), ''),
    coalesce(
      nullif(btrim(p_merchant_type), ''),
      'individual'
    ),
    coalesce(
      nullif(btrim(p_market), ''),
      'taiwan'
    ),
    nullif(btrim(p_contact_name), ''),
    nullif(btrim(p_contact_phone), ''),
    nullif(btrim(p_contact_email), ''),
    nullif(btrim(p_business_license_no), ''),
    nullif(btrim(p_tax_no), ''),
    nullif(btrim(p_address), ''),
    nullif(btrim(p_logo_url), ''),
    nullif(btrim(p_cover_image_url), ''),
    nullif(btrim(p_website_url), ''),
    nullif(btrim(p_description), ''),
    'pending',
    now(),
    now()
  )
  returning *
  into v_merchant;

  return v_merchant;
end;
$$;

revoke all
on function public.create_merchant(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public, anon;

grant execute
on function public.create_merchant(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to authenticated;

commit;
