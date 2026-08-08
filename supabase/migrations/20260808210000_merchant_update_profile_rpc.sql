-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Part 29-15B
-- Merchant Profile Update RPC
-- ============================================================

begin;

create or replace function public.update_merchant_profile(
  p_merchant_id uuid,
  p_name text,
  p_legal_name text default null,
  p_merchant_type text default 'company',
  p_market text default 'taiwan',
  p_contact_name text default null,
  p_contact_phone text default null,
  p_contact_email text default null,
  p_business_license_no text default null,
  p_tax_no text default null,
  p_address text default null,
  p_logo_url text default null,
  p_cover_image_url text default null,
  p_website_url text default null,
  p_description text default null
)
returns public.merchants
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_name text;
  v_merchant public.merchants;
begin
  -- ----------------------------------------------------------
  -- Authentication
  -- ----------------------------------------------------------

  if auth.uid() is null then
    raise exception '使用者尚未登入。';
  end if;

  -- ----------------------------------------------------------
  -- Permission
  -- ----------------------------------------------------------

  perform public.assert_current_user_permission(
    'merchant.update'
  );

  -- ----------------------------------------------------------
  -- Validate merchant
  -- ----------------------------------------------------------

  if p_merchant_id is null then
    raise exception '商家 ID 不可空白。';
  end if;

  if not exists (
    select 1
    from public.merchants
    where id = p_merchant_id
      and deleted_at is null
  ) then
    raise exception '找不到指定商家。';
  end if;

  -- ----------------------------------------------------------
  -- Validate name
  -- ----------------------------------------------------------

  v_name :=
    nullif(
      btrim(p_name),
      ''
    );

  if v_name is null then
    raise exception '商家名稱不可空白。';
  end if;

  -- ----------------------------------------------------------
  -- Update profile only
  -- ----------------------------------------------------------

  update public.merchants
  set
    name =
      v_name,

    legal_name =
      nullif(
        btrim(p_legal_name),
        ''
      ),

    merchant_type =
      coalesce(
        nullif(
          btrim(p_merchant_type),
          ''
        ),
        merchant_type
      ),

    market =
      coalesce(
        nullif(
          btrim(p_market),
          ''
        ),
        market
      ),

    contact_name =
      nullif(
        btrim(p_contact_name),
        ''
      ),

    contact_phone =
      nullif(
        btrim(p_contact_phone),
        ''
      ),

    contact_email =
      nullif(
        btrim(p_contact_email),
        ''
      ),

    business_license_no =
      nullif(
        btrim(p_business_license_no),
        ''
      ),

    tax_no =
      nullif(
        btrim(p_tax_no),
        ''
      ),

    address =
      nullif(
        btrim(p_address),
        ''
      ),

    logo_url =
      nullif(
        btrim(p_logo_url),
        ''
      ),

    cover_image_url =
      nullif(
        btrim(p_cover_image_url),
        ''
      ),

    website_url =
      nullif(
        btrim(p_website_url),
        ''
      ),

    description =
      nullif(
        btrim(p_description),
        ''
      ),

    updated_at =
      now()

  where id =
    p_merchant_id

  returning *
  into v_merchant;

  return v_merchant;
end;
$$;

-- ------------------------------------------------------------
-- RPC Permissions
-- ------------------------------------------------------------

revoke all
on function public.update_merchant_profile(
  uuid,
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
from public, anon, authenticated;

grant execute
on function public.update_merchant_profile(
  uuid,
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
