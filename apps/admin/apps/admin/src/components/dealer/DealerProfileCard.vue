<script setup lang="ts">

import type {
  Dealer,
} from '../../types/dealer'


interface Props {
  dealer: Dealer
}


const props =
  defineProps<Props>()



function dealerInitial(
  name: string,
): string {

  return name
    ? name.slice(0, 1)
    : '?'

}



function marketText(
  value: Dealer['market'],
): string {

  switch (value) {

    case 'taiwan':
      return '台灣市場'

    case 'china':
      return '中國市場'

    case 'cross_border':
      return '跨境市場'

    default:
      return value

  }

}



function levelText(
  value: Dealer['level'],
): string {

  switch (value) {

    case 'normal':
      return '普通經銷商'

    case 'star_1':
      return '一星經銷商'

    case 'star_2':
      return '二星經銷商'

    case 'star_3':
      return '三星經銷商'

    case 'star_4':
      return '四星經銷商'

    case 'star_5':
      return '五星經銷商'

    case 'star_6':
      return '六星經銷商'

    case 'star_7':
      return '七星經銷商'

    default:
      return value

  }

}



function statusText(
  value: Dealer['status'],
): string {

  switch (value) {

    case 'pending':
      return '待審核'

    case 'approved':
      return '已通過'

    case 'active':
      return '正常啟用'

    case 'suspended':
      return '已暫停'

    case 'disabled':
      return '已停用'

    default:
      return value

  }

}



function formatDate(
  value: string,
): string {

  if (!value) {

    return '-'

  }


  return new Intl.DateTimeFormat(
    'zh-TW',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(
    new Date(value),
  )

}

</script>


<template>

  <section
    class="profile-card"
  >

    <div
      class="profile-header"
    >

      <div
        class="avatar"
      >
        {{
          dealerInitial(
            props.dealer.name,
          )
        }}
      </div>


      <div>

        <h2>
          {{ dealer.name }}
        </h2>

        <p>
          {{ dealer.dealerNo }}
        </p>

      </div>

    </div>



    <div
      class="profile-grid"
    >

      <div class="item">

        <span>
          手機號碼
        </span>

        <strong>
          {{
            dealer.phone || '-'
          }}
        </strong>

      </div>



      <div class="item">

        <span>
          Email
        </span>

        <strong>
          {{
            dealer.email || '-'
          }}
        </strong>

      </div>



      <div class="item">

        <span>
          市場
        </span>

        <strong>
          {{
            marketText(
              dealer.market,
            )
          }}
        </strong>

      </div>



      <div class="item">

        <span>
          經銷等級
        </span>

        <strong>
          {{
            levelText(
              dealer.level,
            )
          }}
        </strong>

      </div>



      <div class="item">

        <span>
          狀態
        </span>

        <strong
          class="status"
        >
          {{
            statusText(
              dealer.status,
            )
          }}
        </strong>

      </div>



      <div class="item">

        <span>
          建立時間
        </span>

        <strong>
          {{
            formatDate(
              dealer.createdAt,
            )
          }}
        </strong>

      </div>


    </div>


    <div
      class="remark"
    >

      <span>
        備註
      </span>


      <p>
        {{
          dealer.remark || '無'
        }}
      </p>

    </div>


  </section>

</template>


<style scoped>

.profile-card {

  padding: 24px;

  border:
    1px solid #e5e7eb;

  border-radius: 18px;

  background:
    #ffffff;

  box-shadow:
    0 10px 25px
    rgba(15,23,42,0.05);

}



.profile-header {

  display:flex;

  align-items:center;

  gap:16px;

  margin-bottom:24px;

}



.avatar {

  display:grid;

  width:64px;

  height:64px;

  place-items:center;

  border-radius:18px;

  background:#eef2ff;

  color:#3157d6;

  font-size:28px;

  font-weight:800;

}



.profile-header h2 {

  margin:0;

  color:#0f172a;

}



.profile-header p {

  margin:6px 0 0;

  color:#64748b;

}



.profile-grid {

  display:grid;

  grid-template-columns:
    repeat(3,minmax(0,1fr));

  gap:18px;

}



.item {

  padding:16px;

  border-radius:12px;

  background:#f8fafc;

}



.item span {

  display:block;

  margin-bottom:8px;

  color:#64748b;

  font-size:13px;

}



.item strong {

  color:#0f172a;

}



.status {

  color:#15803d;

}



.remark {

  margin-top:20px;

  padding-top:20px;

  border-top:
    1px solid #eef2f7;

}



.remark span {

  color:#64748b;

  font-size:13px;

}



.remark p {

  margin:8px 0 0;

  color:#334155;

}



@media(max-width:900px){

.profile-grid{

grid-template-columns:1fr;

}

}

</style>