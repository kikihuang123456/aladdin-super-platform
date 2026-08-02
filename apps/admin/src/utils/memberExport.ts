import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import type {
  MemberListItem,
} from '../types/member'

/* =========================================================
 * Shared Helpers
 * ======================================================= */

function getStatusLabel(
  status:
    MemberListItem['status'],
): string {
  switch (status) {
    case 'active':
      return '正常'

    case 'pending':
      return '待審核'

    case 'disabled':
      return '停用'

    case 'suspended':
      return '暫停'

    case 'deleted':
      return '已刪除'

    default:
      return '未知狀態'
  }
}

function formatExportDate(
  value: string,
): string {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)
}

/* =========================================================
 * Excel Export
 * ======================================================= */

export function exportMemberExcel(
  members: MemberListItem[],
): void {
  if (members.length === 0) {
    throw new Error(
      '目前沒有可匯出的會員資料。',
    )
  }

  const rows =
    members.map(
      (member) => ({
        會員編號:
          member.memberCode ?? '',

        姓名:
          member.name,

        Email:
          member.email ?? '',

        手機:
          member.phone ?? '',

        會員等級:
          member.levelName,

        狀態:
          getStatusLabel(
            member.status,
          ),

        推薦人:
          member.referrerName ?? '',

        建立日期:
          formatExportDate(
            member.createdAt,
          ),

        更新日期:
          formatExportDate(
            member.updatedAt,
          ),
      }),
    )

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows,
    )

  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 16 },
    { wch: 30 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
  ]

  const workbook =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    '會員資料',
  )

  const excelBuffer =
    XLSX.write(
      workbook,
      {
        bookType: 'xlsx',
        type: 'array',
      },
    )

  const blob =
    new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    )

  saveAs(
    blob,
    `members-${Date.now()}.xlsx`,
  )
}

/* =========================================================
 * CSV Export
 * ======================================================= */

function escapeCsvValue(
  value: unknown,
): string {
  const normalizedValue =
    value === null ||
    value === undefined
      ? ''
      : String(value)

  return `"${normalizedValue.replace(
    /"/g,
    '""',
  )}"`
}

export function exportMemberCsv(
  members: MemberListItem[],
): void {
  if (members.length === 0) {
    throw new Error(
      '目前沒有可匯出的會員資料。',
    )
  }

  const headers = [
    '會員編號',
    '姓名',
    'Email',
    '手機',
    '會員等級',
    '狀態',
    '推薦人',
    '建立日期',
    '更新日期',
  ]

  const rows =
    members.map(
      (member) => [
        member.memberCode,
        member.name,
        member.email,
        member.phone,
        member.levelName,
        getStatusLabel(
          member.status,
        ),
        member.referrerName ?? '',
        formatExportDate(
          member.createdAt,
        ),
        formatExportDate(
          member.updatedAt,
        ),
      ],
    )

  const csvContent = [
    headers,
    ...rows,
  ]
    .map(
      (row) =>
        row
          .map(
            escapeCsvValue,
          )
          .join(','),
    )
    .join('\r\n')

  const utf8Bom =
    '\uFEFF'

  const blob =
    new Blob(
      [
        utf8Bom,
        csvContent,
      ],
      {
        type:
          'text/csv;charset=utf-8',
      },
    )

  saveAs(
    blob,
    `members-${Date.now()}.csv`,
  )
}

/* =========================================================
 * PDF Print Export
 * ======================================================= */

function escapeHtml(
  value: unknown,
): string {
  const normalizedValue =
    value === null ||
    value === undefined
      ? ''
      : String(value)

  return normalizedValue
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&#039;',
    )
}

export function exportMemberPdf(
  members: MemberListItem[],
): void {
  if (members.length === 0) {
    throw new Error(
      '目前沒有可匯出的會員資料。',
    )
  }

  const rows =
    members
      .map(
        (member) => `
          <tr>
            <td>
              ${escapeHtml(
                member.memberCode,
              )}
            </td>

            <td>
              ${escapeHtml(
                member.name,
              )}
            </td>

            <td>
              ${escapeHtml(
                member.email,
              )}
            </td>

            <td>
              ${escapeHtml(
                member.phone,
              )}
            </td>

            <td>
              ${escapeHtml(
                member.levelName,
              )}
            </td>

            <td>
              ${escapeHtml(
                getStatusLabel(
                  member.status,
                ),
              )}
            </td>

            <td>
              ${escapeHtml(
                member.referrerName ??
                '',
              )}
            </td>

            <td>
              ${escapeHtml(
                formatExportDate(
                  member.createdAt,
                ),
              )}
            </td>

            <td>
              ${escapeHtml(
                formatExportDate(
                  member.updatedAt,
                ),
              )}
            </td>
          </tr>
        `,
      )
      .join('')

  const printWindow =
    window.open(
      '',
      '_blank',
      'width=1200,height=800',
    )

  if (!printWindow) {
    throw new Error(
      '無法開啟 PDF 列印視窗，請確認瀏覽器沒有封鎖彈出視窗。',
    )
  }

  const generatedAt =
    new Intl.DateTimeFormat(
      'zh-TW',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(
      new Date(),
    )

  printWindow.document.write(`
    <!doctype html>

    <html lang="zh-Hant">
      <head>
        <meta charset="UTF-8">

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >

        <title>
          ALADDIN 會員資料報表
        </title>

        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #0f172a;
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "PingFang TC",
              "Microsoft JhengHei",
              Arial,
              sans-serif;
          }

          .report-header {
            display: flex;
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 2px solid #3157d6;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
          }

          .report-title {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
          }

          .report-subtitle {
            margin: 6px 0 0;
            color: #64748b;
            font-size: 11px;
          }

          .report-meta {
            color: #64748b;
            font-size: 10px;
            line-height: 1.7;
            text-align: right;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 9px;
          }

          th,
          td {
            padding: 7px 6px;
            border: 1px solid #cbd5e1;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
          }

          th {
            background: #e2e8f0;
            color: #0f172a;
            font-weight: 800;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          .report-footer {
            margin-top: 12px;
            color: #94a3b8;
            font-size: 9px;
            text-align: right;
          }

          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>
        <header class="report-header">
          <div>
            <h1 class="report-title">
              ALADDIN 會員資料報表
            </h1>

            <p class="report-subtitle">
              Enterprise Member Management Report
            </p>
          </div>

          <div class="report-meta">
            <div>
              匯出時間：
              ${escapeHtml(
                generatedAt,
              )}
            </div>

            <div>
              資料筆數：
              ${members.length}
            </div>
          </div>
        </header>

        <table>
          <thead>
            <tr>
              <th>會員編號</th>
              <th>姓名</th>
              <th>Email</th>
              <th>手機</th>
              <th>會員等級</th>
              <th>狀態</th>
              <th>推薦人</th>
              <th>建立日期</th>
              <th>更新日期</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <footer class="report-footer">
          ALADDIN Super Platform
          ／會員管理 ERP
        </footer>

        <script>
          window.addEventListener(
            'load',
            () => {
              window.print()
            },
          )
        <\/script>
      </body>
    </html>
  `)

  printWindow.document.close()
}