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
