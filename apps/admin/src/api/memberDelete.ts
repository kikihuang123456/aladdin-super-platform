import {
  supabase,
} from '../lib/supabase'

export interface DeleteMembersInput {
  memberIds: string[]
}

export interface DeleteMembersResponse {
  success: boolean
  deletedIds: string[]
  message: string
  error?: string
}

function normalizeMemberIds(
  memberIds: string[],
): string[] {
  return Array.from(
    new Set(
      memberIds
        .map((memberId) =>
          memberId.trim(),
        )
        .filter(Boolean),
    ),
  )
}

export async function deleteMembers(
  input: DeleteMembersInput,
): Promise<DeleteMembersResponse> {
  const memberIds =
    normalizeMemberIds(
      input.memberIds,
    )

  if (memberIds.length === 0) {
    return {
      success: false,
      deletedIds: [],
      message:
        '請至少選取一位會員。',
      error:
        '沒有可刪除的會員 ID。',
    }
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from('members')
      .delete()
      .in(
        'id',
        memberIds,
      )
      .select('id')

    if (error) {
      throw error
    }

    const deletedIds =
      (data ?? []).map(
        (record) =>
          String(record.id),
      )


    if (
      deletedIds.length !==
      memberIds.length
    ) {
      throw new Error(
        `預計刪除 ${memberIds.length} 位會員，但實際只刪除 ${deletedIds.length} 位，請檢查 RLS Delete Policy。`,
      )
    }

    return {
      success: true,
      deletedIds,
      message:
        `已成功刪除 ${deletedIds.length} 位會員。`,
    }
  } catch (caughtError) {


  return {
    success: false,
    deletedIds: [],
    message: '批次刪除會員失敗。',
    error:
      caughtError instanceof Error
        ? caughtError.message
        : JSON.stringify(caughtError),
  }
}
}