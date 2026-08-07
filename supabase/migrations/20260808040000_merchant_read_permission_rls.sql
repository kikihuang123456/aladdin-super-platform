-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Merchant Read Privilege Compatibility Fix
--
-- Current frontend still performs merchant review / status
-- updates directly against public.merchants.
--
-- Therefore this migration ONLY restores SELECT privilege.
-- Full RLS mutation hardening will be performed after
-- review/update actions are migrated to secured RPCs.
-- ============================================================

begin;

grant select
on table public.merchants
to authenticated;

commit;
