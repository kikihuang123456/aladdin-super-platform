create or replace function public.restore_deleted_merchant(
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
    deleted_at = null,
    archived_at = null,
    archived_by = null,
    updated_at = now()
  where id = p_merchant_id
    and deleted_at is not null
  returning *
  into v_merchant;

  if v_merchant.id is null then
    raise exception 'MERCHANT_NOT_FOUND_OR_NOT_DELETED';
  end if;

  return v_merchant;
end;
$$;

revoke all
on function public.restore_deleted_merchant(uuid)
from public;

revoke all
on function public.restore_deleted_merchant(uuid)
from anon;

grant execute
on function public.restore_deleted_merchant(uuid)
to authenticated;