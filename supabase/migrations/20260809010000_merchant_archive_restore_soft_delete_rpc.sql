-- ============================================================
-- ALADDIN Super Platform
-- Merchant Part 29-18
-- Merchant Archive / Restore / Soft Delete RPC
-- ============================================================


-- ============================================================
-- 1. Archive Merchant
-- ============================================================

create or replace function public.archive_merchant(
  p_merchant_id uuid
)
returns public.merchants
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_merchant public.merchants;
begin
  if auth.uid() is null then
    raise exception '使用者尚未登入。';
  end if;

  perform public.assert_current_user_permission(
    'merchant.update'
  );

  update public.merchants
  set
    archived_at = now(),
    archived_by = auth.uid(),
    updated_at = now()
  where id = p_merchant_id
    and deleted_at is null
  returning *
  into v_merchant;

  if v_merchant.id is null then
    raise exception 'MERCHANT_NOT_FOUND_OR_DELETED';
  end if;

  return v_merchant;
end;
$$;


-- ============================================================
-- 2. Restore Merchant
-- ============================================================

create or replace function public.restore_merchant(
  p_merchant_id uuid
)
returns public.merchants
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_merchant public.merchants;
begin
  if auth.uid() is null then
    raise exception '使用者尚未登入。';
  end if;

  perform public.assert_current_user_permission(
    'merchant.update'
  );

  update public.merchants
  set
    archived_at = null,
    archived_by = null,
    updated_at = now()
  where id = p_merchant_id
    and deleted_at is null
  returning *
  into v_merchant;

  if v_merchant.id is null then
    raise exception 'MERCHANT_NOT_FOUND_OR_DELETED';
  end if;

  return v_merchant;
end;
$$;


-- ============================================================
-- 3. Soft Delete Merchant
-- ============================================================

create or replace function public.soft_delete_merchant(
  p_merchant_id uuid
)
returns public.merchants
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_merchant public.merchants;
begin
  if auth.uid() is null then
    raise exception '使用者尚未登入。';
  end if;

  perform public.assert_current_user_permission(
    'merchant.update'
  );

  update public.merchants
  set
    deleted_at = now(),
    updated_at = now()
  where id = p_merchant_id
    and deleted_at is null
  returning *
  into v_merchant;

  if v_merchant.id is null then
    raise exception 'MERCHANT_NOT_FOUND_OR_ALREADY_DELETED';
  end if;

  return v_merchant;
end;
$$;


-- ============================================================
-- 4. Function Permissions
-- ============================================================

revoke all
on function public.archive_merchant(uuid)
from public;

revoke all
on function public.restore_merchant(uuid)
from public;

revoke all
on function public.soft_delete_merchant(uuid)
from public;


grant execute
on function public.archive_merchant(uuid)
to authenticated;

grant execute
on function public.restore_merchant(uuid)
to authenticated;

grant execute
on function public.soft_delete_merchant(uuid)
to authenticated;