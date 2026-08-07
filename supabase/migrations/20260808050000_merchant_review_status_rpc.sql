-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Merchant Review / Status Secure RPC
--
-- review_merchant()
--   permission: merchant.approve
--
-- update_merchant_status()
--   permission: merchant.update
--
-- Audit actor always comes from auth.uid().
-- ============================================================

begin;


-- ============================================================
-- 1. Review Merchant
-- ============================================================

create or replace function
  public.review_merchant(
    p_merchant_id uuid,
    p_status text,
    p_review_remark text default null
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
  v_status text;
  v_merchant public.merchants;
begin

  if auth.uid() is null then
    raise exception
      '使用者尚未登入。';
  end if;

  perform
    public.assert_current_user_permission(
      'merchant.approve'
    );

  v_status :=
    lower(
      btrim(
        coalesce(
          p_status,
          ''
        )
      )
    );

  if v_status not in (
    'approved',
    'rejected'
  ) then
    raise exception
      '商家審核狀態僅允許 approved 或 rejected。';
  end if;

  update
    public.merchants
  set
    status =
      v_status,

    reviewed_by =
      auth.uid(),

    reviewed_at =
      now(),

    review_remark =
      nullif(
        btrim(
          p_review_remark
        ),
        ''
      ),

    activated_at =
      case
        when v_status = 'approved'
          then now()
        else null
      end,

    updated_at =
      now()
  where
    id =
      p_merchant_id
  returning
    *
  into
    v_merchant;

  if not found then
    raise exception
      '找不到指定商家：%',
      p_merchant_id;
  end if;

  return
    v_merchant;

end;
$$;


-- ============================================================
-- 2. Update Merchant Status
-- ============================================================

create or replace function
  public.update_merchant_status(
    p_merchant_id uuid,
    p_status text,
    p_remark text default null
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
  v_status text;
  v_merchant public.merchants;
begin

  if auth.uid() is null then
    raise exception
      '使用者尚未登入。';
  end if;

  perform
    public.assert_current_user_permission(
      'merchant.update'
    );

  v_status :=
    lower(
      btrim(
        coalesce(
          p_status,
          ''
        )
      )
    );

  if v_status not in (
    'active',
    'suspended',
    'disabled'
  ) then
    raise exception
      '商家狀態僅允許 active、suspended 或 disabled。';
  end if;

  update
    public.merchants
  set
    status =
      v_status,

    reviewed_by =
      auth.uid(),

    review_remark =
      case
        when v_status in (
          'suspended',
          'disabled'
        )
          then nullif(
            btrim(
              p_remark
            ),
            ''
          )
        else review_remark
      end,

    activated_at =
      case
        when v_status = 'active'
          then now()
        else activated_at
      end,

    updated_at =
      now()
  where
    id =
      p_merchant_id
  returning
    *
  into
    v_merchant;

  if not found then
    raise exception
      '找不到指定商家：%',
      p_merchant_id;
  end if;

  return
    v_merchant;

end;
$$;


-- ============================================================
-- 3. Function Privileges
-- ============================================================

revoke all
on function
  public.review_merchant(
    uuid,
    text,
    text
  )
from public;

grant execute
on function
  public.review_merchant(
    uuid,
    text,
    text
  )
to authenticated;


revoke all
on function
  public.update_merchant_status(
    uuid,
    text,
    text
  )
from public;

grant execute
on function
  public.update_merchant_status(
    uuid,
    text,
    text
  )
to authenticated;


-- ============================================================
-- 4. Documentation
-- ============================================================

comment on function
  public.review_merchant(
    uuid,
    text,
    text
  )
is
  'ALADDIN Merchant ERP: approve/reject merchant with merchant.approve permission and auth.uid audit actor.';

comment on function
  public.update_merchant_status(
    uuid,
    text,
    text
  )
is
  'ALADDIN Merchant ERP: activate/suspend/disable merchant with merchant.update permission and auth.uid audit actor.';


commit;
