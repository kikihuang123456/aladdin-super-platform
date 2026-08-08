import {
  supabase,
} from '../lib/supabase'

const MERCHANT_MEDIA_BUCKET =
  'merchant-media'

const MAX_FILE_SIZE =
  5 * 1024 * 1024

const ALLOWED_MIME_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ])

export type MerchantMediaType =
  'logo' |
  'cover'

export interface UploadMerchantImageInput {
  merchantId:
    string

  file:
    File

  type:
    MerchantMediaType
}

export interface UploadMerchantImageResult {
  path:
    string

  publicUrl:
    string
}

function getFileExtension(
  file:
    File,
): string {
  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase()

  if (extension) {
    return extension
  }

  switch (file.type) {
    case 'image/jpeg':
      return 'jpg'

    case 'image/png':
      return 'png'

    case 'image/webp':
      return 'webp'

    default:
      return 'bin'
  }
}

function validateImageFile(
  file:
    File,
): void {
  if (
    !ALLOWED_MIME_TYPES.has(
      file.type,
    )
  ) {
    throw new Error(
      '圖片格式僅支援 JPEG、PNG、WebP。',
    )
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      '圖片大小不可超過 5MB。',
    )
  }
}

export async function uploadMerchantImage(
  input:
    UploadMerchantImageInput,
): Promise<UploadMerchantImageResult> {
  validateImageFile(
    input.file,
  )

  const merchantId =
    input.merchantId.trim()

  if (!merchantId) {
    throw new Error(
      '缺少商家 ID。',
    )
  }

  const extension =
    getFileExtension(
      input.file,
    )

  const fileName =
    `${input.type}-${Date.now()}-${crypto.randomUUID()}.${extension}`

  const path =
    `${merchantId}/${input.type}/${fileName}`

  const {
    error:
      uploadError,
  } =
    await supabase.storage
      .from(
        MERCHANT_MEDIA_BUCKET,
      )
      .upload(
        path,
        input.file,
        {
          cacheControl:
            '3600',

          upsert:
            false,

          contentType:
            input.file.type,
        },
      )

  if (uploadError) {
    throw new Error(
      uploadError.message ||
      '商家圖片上傳失敗。',
    )
  }

  const {
    data,
  } =
    supabase.storage
      .from(
        MERCHANT_MEDIA_BUCKET,
      )
      .getPublicUrl(
        path,
      )

  if (
    !data.publicUrl
  ) {
    throw new Error(
      '無法取得商家圖片公開網址。',
    )
  }

    return {
    path,

    publicUrl:
      data.publicUrl,
  }
}

export function getMerchantMediaPathFromUrl(
  url:
    string | null | undefined,
): string | null {
  if (!url) {
    return null
  }

  const normalizedUrl =
    url.trim()

  if (!normalizedUrl) {
    return null
  }

  const marker =
    `/storage/v1/object/public/${MERCHANT_MEDIA_BUCKET}/`

  const markerIndex =
    normalizedUrl.indexOf(
      marker,
    )

  if (markerIndex < 0) {
    return null
  }

  const path =
    normalizedUrl.slice(
      markerIndex +
      marker.length,
    )

  if (!path) {
    return null
  }

  try {
    return decodeURIComponent(
      path,
    )
  } catch {
    return path
  }
}
export async function deleteMerchantImage(
  path:
    string | null | undefined,
): Promise<void> {
  if (!path) {
    return
  }

  const normalizedPath =
    path.trim()

  if (!normalizedPath) {
    return
  }

  const {
    error,
  } =
    await supabase.storage
      .from(
        MERCHANT_MEDIA_BUCKET,
      )
      .remove([
        normalizedPath,
      ])

  if (error) {
    throw new Error(
      error.message ||
      '商家圖片刪除失敗。',
    )
  }
}

export async function deleteMerchantImageByUrl(
  url:
    string | null | undefined,
): Promise<void> {
  const path =
    getMerchantMediaPathFromUrl(
      url,
    )

  if (!path) {
    return
  }

  await deleteMerchantImage(
    path,
  )
}



