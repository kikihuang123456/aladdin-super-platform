-- ============================================================
-- ALADDIN Super Platform
-- Merchant ERP
--
-- Part 29-16B
-- Merchant Media Storage
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Create / update public merchant-media bucket
-- ------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'merchant-media',
  'merchant-media',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id)
do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- 2. Remove previous Merchant media policies if re-applied
-- ------------------------------------------------------------

drop policy if exists
  "merchant_media_authenticated_insert"
on storage.objects;

drop policy if exists
  "merchant_media_authenticated_update"
on storage.objects;

drop policy if exists
  "merchant_media_authenticated_delete"
on storage.objects;

drop policy if exists
  "merchant_media_public_read"
on storage.objects;

-- ------------------------------------------------------------
-- 3. Public read
-- ------------------------------------------------------------

create policy
  "merchant_media_public_read"
on storage.objects
for select
to public
using (
  bucket_id = 'merchant-media'
);

-- ------------------------------------------------------------
-- 4. Authenticated insert
-- Permission is still enforced by application flow.
-- ------------------------------------------------------------

create policy
  "merchant_media_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'merchant-media'
  and auth.uid() is not null
  and public.has_current_user_permission(
    'merchant.update'
  )
);

-- ------------------------------------------------------------
-- 5. Authenticated update
-- ------------------------------------------------------------

create policy
  "merchant_media_authenticated_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'merchant-media'
  and auth.uid() is not null
  and public.has_current_user_permission(
    'merchant.update'
  )
)
with check (
  bucket_id = 'merchant-media'
  and auth.uid() is not null
  and public.has_current_user_permission(
    'merchant.update'
  )
);

-- ------------------------------------------------------------
-- 6. Authenticated delete
-- ------------------------------------------------------------

create policy
  "merchant_media_authenticated_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'merchant-media'
  and auth.uid() is not null
  and public.has_current_user_permission(
    'merchant.update'
  )
);

commit;
