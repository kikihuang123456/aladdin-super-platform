-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Merchant Create Transaction
--
-- Responsibilities:
-- 1. Generate merchant number: MER-100001...
-- 2. Enforce merchant.create permission
-- 3. Create merchant atomically
-- 4. Force initial status = pending
-- 5. Never trust frontend for audit / status control
-- ============================================================

begin;


-- ============================================================
-- 1. Merchant Number Sequence
-- ============================================================

create sequence if not exists
  public.merchant_no_seq
  as bigint
  start with 100001
  increment by 1
  minvalue 100001
  no maxvalue
  cache 1;


-- ============================================================
-- 2. Synchronize Sequence With Existing MER Numbers
-- ============================================================

do $$
declare
  v_max_no bigint;
begin
  select
    max(
      substring(
        merchant_no
        from '^MER-([0-9]+)$'
      )::bigint
    )
  into
    v_max_no
  from
    public.merchants
  where
    merchant_no ~ '^MER-[0-9]+$';

  if v_max_no is not null then
    perform setval(
      'public.merchant_no_seq',
      greatest(
        v_max_no,
        100000
      ),
      true
    );
  end if;
end;
$$;


-- ============================================================
-- 3. Merchant Number Generator
-- ============================================================

create or replace function
  public.generate_merchant_no()
returns text
language plpgsql
security definer
set search_path =
  public,
  pg_temp
as $$
declare
  v_merchant_no text;
begin
  loop
    v_merchant_no :=
      'MER-' ||
      lpad(
        nextval(
          'public.merchant_no_seq'
        )::text,
        6,
        '0'
      );

    exit when not exists (
      select
        1
      from
        public.merchants
      where
        merchant_no =
          v_merchant_no
    );
  end loop;

  return v_merchant_no;
end;
$$;


revoke all
on function
  public.generate_merchant_no()
from public;


-- ============================================================
-- 4. Create Merchant Transaction RPC
-- ============================================================

create or replace function
  public.create_merchant(
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
    p_description text default null
  )
returns public.merchants
language plpgsql
security definer
set search_path =
  public,
  auth,
  pg_temp
as $$
declare
  v_name text;
  v_merchant_type text;
  v_market text;
  v_merchant_no text;
  v_merchant public.merchants;
begin

  -- ----------------------------------------------------------
  -- Authentication
  -- ----------------------------------------------------------

  if auth.uid() is null then
    raise exception
      '使用者尚未登入。';
  end if;


  -- ----------------------------------------------------------
  -- Permission
  -- ----------------------------------------------------------

  perform
    public.assert_current_user_permission(
      'merchant.create'
    );


  -- ----------------------------------------------------------
  -- Normalize Required Fields
  -- ----------------------------------------------------------

  v_name :=
    nullif(
      btrim(p_name),
      ''
    );

  v_merchant_type :=
    lower(
      coalesce(
        nullif(
          btrim(p_merchant_type),
          ''
        ),
        'company'
      )
    );

  v_market :=
    lower(
      coalesce(
        nullif(
          btrim(p_market),
          ''
        ),
        'taiwan'
      )
    );


  -- ----------------------------------------------------------
  -- Validation
  -- ----------------------------------------------------------

  if v_name is null then
    raise exception
      '商家名稱不可空白。';
  end if;


  if v_merchant_type not in (
    'individual',
    'company',
    'brand',
    'platform'
  ) then
    raise exception
      '無效的商家類型：%',
      v_merchant_type;
  end if;


  if v_market not in (
    'taiwan',
    'china',
    'cross_border'
  ) then
    raise exception
      '無效的商家市場：%',
      v_market;
  end if;


  -- ----------------------------------------------------------
  -- Generate Merchant Number
  -- ----------------------------------------------------------

  v_merchant_no :=
    public.generate_merchant_no();


  -- ----------------------------------------------------------
  -- Insert Merchant
  --
  -- Status is always pending.
  -- Review fields cannot be supplied by caller.
  -- ----------------------------------------------------------

  insert into
    public.merchants (
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
      description,
      status,
      reviewed_by,
      reviewed_at,
      review_remark,
      activated_at
    )
  values (
    v_merchant_no,
    v_name,
    nullif(
      btrim(p_legal_name),
      ''
    ),
    v_merchant_type,
    v_market,
    nullif(
      btrim(p_contact_name),
      ''
    ),
    nullif(
      btrim(p_contact_phone),
      ''
    ),
    nullif(
      btrim(p_contact_email),
      ''
    ),
    nullif(
      btrim(p_business_license_no),
      ''
    ),
    nullif(
      btrim(p_tax_no),
      ''
    ),
    nullif(
      btrim(p_address),
      ''
    ),
    nullif(
      btrim(p_logo_url),
      ''
    ),
    nullif(
      btrim(p_description),
      ''
    ),
    'pending',
    null,
    null,
    null,
    null
  )
  returning
    *
  into
    v_merchant;


  return
    v_merchant;

end;
$$;


-- ============================================================
-- 5. RPC Permissions
-- ============================================================

revoke all
on function
  public.create_merchant(
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
from public;


grant execute
on function
  public.create_merchant(
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


-- ============================================================
-- 6. Documentation
-- ============================================================

comment on function
  public.create_merchant(
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
is
  'ALADDIN Merchant ERP: securely creates a pending merchant with server-generated MER merchant number and merchant.create permission enforcement.';


commit;
