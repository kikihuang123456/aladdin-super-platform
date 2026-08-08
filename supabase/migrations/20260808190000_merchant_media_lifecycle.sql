-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Part 29-14B
-- Merchant Media & Lifecycle
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Merchant Media
-- ------------------------------------------------------------

alter table public.merchants
  add column if not exists cover_image_url text;

alter table public.merchants
  add column if not exists website_url text;


-- ------------------------------------------------------------
-- 2. Merchant Lifecycle / Archive
-- ------------------------------------------------------------

alter table public.merchants
  add column if not exists archived_at timestamptz;

alter table public.merchants
  add column if not exists archived_by uuid;

alter table public.merchants
  add column if not exists deleted_at timestamptz;


-- ------------------------------------------------------------
-- 3. Documentation
-- ------------------------------------------------------------

comment on column public.merchants.logo_url is
  'Merchant logo image URL.';

comment on column public.merchants.cover_image_url is
  'Merchant storefront / cover image URL.';

comment on column public.merchants.website_url is
  'Merchant external website or storefront URL.';

comment on column public.merchants.archived_at is
  'Timestamp when merchant was archived.';

comment on column public.merchants.archived_by is
  'Authenticated user UUID that archived the merchant.';

comment on column public.merchants.deleted_at is
  'Soft-delete timestamp. NULL means merchant is not deleted.';

commit;
