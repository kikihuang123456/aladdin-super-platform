<template>
  <AdminLayout>
    <div class="dashboard">
      <section class="hero">
        <div class="hero__content">
          <span class="badge">
            阿拉丁企業版
          </span>

          <h1>
            ALADDIN Super Platform
          </h1>

          <p class="subtitle">
            企業級商業管理平台
          </p>

          <p class="description">
            台灣 × 中國大陸 × AI × 商城 × 文旅 × ERP
          </p>

          <div class="version">
            Sprint 1・Platform Core v0.1
          </div>
        </div>
      </section>

      <section class="kpi-section">
        <div class="section-heading">
          <div>
            <p class="section-eyebrow">
              即時營運概況
            </p>

            <h2>
              平台核心指標
            </h2>
          </div>

          <span class="section-status">
            ● 系統正常
          </span>
        </div>

        <div class="kpi-grid">
          <KPICard
            label="會員總數"
            value="12,680"
            trend="up"
            trend-text="+8.6%"
            description="較上月成長"
            icon="會"
          />

          <KPICard
            label="合作商家"
            value="326"
            trend="up"
            trend-text="+12"
            description="本月新增商家"
            icon="商"
          />

          <KPICard
            label="經銷商數"
            value="1,248"
            trend="up"
            trend-text="+5.2%"
            description="較上月成長"
            icon="經"
          />

          <KPICard
            label="今日訂單"
            value="568"
            trend="neutral"
            trend-text="即時"
            description="今日累計訂單"
            icon="單"
          />
        </div>
            </section>

      <OrderDashboardCard />

      <section class="system-grid">
        <article class="system-card">
          <span class="system-card__label">
            前端技術
          </span>

          <strong>
            Vue 3 + TypeScript
          </strong>

          <p>
            Vite 開發環境正常運行
          </p>
        </article>

        <article class="system-card">
          <span class="system-card__label">
            後端服務
          </span>

          <strong>
            Supabase
          </strong>

          <p>
            Authentication、API 與資料服務
          </p>
        </article>

        <article class="system-card">
          <span class="system-card__label">
            資料庫
          </span>

          <strong>
            PostgreSQL
          </strong>

          <p>
            企業級關聯式資料庫架構
          </p>
        </article>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '../../layouts/AdminLayout.vue'
import KPICard from '../../components/dashboard/KPICard.vue'
import OrderDashboardCard from '../../components/dashboard/OrderDashboardCard.vue'
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero {
  overflow: hidden;
  padding: 48px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    #3157d6,
    #4169e1,
    #3f6df6
  );
  color: #ffffff;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.18);
}

.hero__content {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 18px;
}

.hero h1 {
  margin: 24px 0 8px;
  font-size: clamp(40px, 5vw, 58px);
  line-height: 1.05;
}

.subtitle {
  margin: 0;
  font-size: 28px;
}

.description {
  margin-top: 20px;
  font-size: 22px;
  opacity: 0.95;
}

.version {
  margin-top: 36px;
  font-size: 20px;
  font-weight: 700;
}

.kpi-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.section-heading h2 {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 28px;
}

.section-eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.section-status {
  color: #16a34a;
  font-size: 14px;
  font-weight: 700;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.system-card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.system-card__label {
  display: block;
  margin-bottom: 12px;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.system-card strong {
  color: #0f172a;
  font-size: 22px;
}

.system-card p {
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero {
    padding: 32px;
  }

  .subtitle {
    font-size: 22px;
  }

  .description {
    font-size: 18px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .kpi-grid,
  .system-grid {
    grid-template-columns: 1fr;
  }
}
</style>