-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Merchant RLS Hardening
--
-- Read:
--   authenticated + merchant.view
--
-- Mutations:
--   create  -> create_merchant()
--   review  -> review_merchant()
--   status  -> update_merchant_status()
--
-- Direct INSERT / UPDATE / DELETE are not allowed.
-- ============================================================

begin;


-- ============================================================
-- 1. Table Privileges
-- ============================================================

grant select
on table public.merchants
to authenticated;

revoke insert, update, delete
on table public.merchants
from authenticated;


-- ============================================================
-- 2. Remove Legacy Broad Policies
-- ============================================================

drop policy if exists
  "authenticated_manage_merchants"
on public.merchants;

drop policy if exists
  "authenticated_read_merchants"
on public.merchants;

drop policy if exists
  "merchants_select_by_permission"
on public.merchants;


-- ============================================================
-- 3. Permission Matrix SELECT Policy
-- ============================================================

create policy
  "merchants_select_by_permission"
on public.merchants
for select
to authenticated
using (
  public.has_current_user_permission(
    'merchant.view'
  )
);


commit;
