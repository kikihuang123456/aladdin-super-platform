<template>
  <div class="auth-layout">
    <div class="auth-layout__background">
      <div class="background-orb background-orb--one" />
      <div class="background-orb background-orb--two" />
      <div class="background-grid" />
    </div>

    <header class="auth-header">
      <RouterLink
        to="/login"
        class="brand"
        aria-label="返回登入頁"
      >
        <div class="brand__logo">
          A
        </div>

        <div class="brand__content">
          <strong>ALADDIN</strong>
          <span>Super Platform</span>
        </div>
      </RouterLink>

      <div class="auth-header__meta">
        Enterprise Commerce Platform
      </div>
    </header>

    <main class="auth-main">
      <section class="auth-intro">
        <p class="auth-intro__eyebrow">
          ALADDIN ENTERPRISE
        </p>

        <h1>
          一站式企業商務
          <br />
          智能管理平台
        </h1>

        <p class="auth-intro__description">
          整合會員、商家、經銷商、商城、文旅、
          AI 與 ERP 管理能力，打造台灣與大陸市場
          共用的企業級營運中台。
        </p>

        <div class="feature-list">
          <article class="feature-item">
            <div class="feature-item__icon">
              01
            </div>

            <div>
              <strong>統一平台核心</strong>
              <span>
                集中管理企業主要營運模組
              </span>
            </div>
          </article>

          <article class="feature-item">
            <div class="feature-item__icon">
              02
            </div>

            <div>
              <strong>角色權限控管</strong>
              <span>
                支援 RBAC 與細粒度權限管理
              </span>
            </div>
          </article>

          <article class="feature-item">
            <div class="feature-item__icon">
              03
            </div>

            <div>
              <strong>跨市場營運</strong>
              <span>
                支援台灣與大陸雙市場架構
              </span>
            </div>
          </article>
        </div>
      </section>

      <section class="auth-panel">
        <div class="auth-panel__card">
          <RouterView />
        </div>

        <p class="auth-panel__security">
          安全連線 · 權限控管 · 企業級資料保護
        </p>
      </section>
    </main>

    <footer class="auth-footer">
      <span>
        © {{ currentYear }} ALADDIN Super Platform
      </span>

      <span>
        Enterprise Administration System
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  RouterLink,
  RouterView,
} from 'vue-router'

const currentYear = computed(
  () => new Date().getFullYear(),
)
</script>

<style scoped>
.auth-layout {
  position: relative;
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  flex-direction: column;
  background:
    linear-gradient(
      135deg,
      #07111f 0%,
      #0e1d35 48%,
      #162949 100%
    );
  color: #ffffff;
}

.auth-layout__background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(4px);
  opacity: 0.65;
}

.background-orb--one {
  top: -180px;
  left: -120px;
  width: 520px;
  height: 520px;
  background:
    radial-gradient(
      circle,
      rgba(65, 105, 225, 0.5) 0%,
      rgba(65, 105, 225, 0) 70%
    );
}

.background-orb--two {
  right: -180px;
  bottom: -220px;
  width: 620px;
  height: 620px;
  background:
    radial-gradient(
      circle,
      rgba(65, 179, 255, 0.32) 0%,
      rgba(65, 179, 255, 0) 72%
    );
}

.background-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px
    );
  background-size: 56px 56px;
  mask-image:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.8),
      transparent
    );
}

.auth-header {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
  padding: 28px 0;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.brand__logo {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border: 1px solid
    rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background:
    linear-gradient(
      135deg,
      #4169e1,
      #35a7ff
    );
  box-shadow:
    0 14px 30px
    rgba(53, 167, 255, 0.22);
  font-size: 22px;
  font-weight: 900;
}

.brand__content {
  display: flex;
  flex-direction: column;
}

.brand__content strong {
  font-size: 17px;
  letter-spacing: 0.12em;
}

.brand__content span {
  margin-top: 2px;
  color:
    rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.auth-header__meta {
  color:
    rgba(255, 255, 255, 0.52);
  font-size: 13px;
  letter-spacing: 0.06em;
}

.auth-main {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(1240px, calc(100% - 48px));
  margin: auto;
  padding: 48px 0 72px;
  grid-template-columns:
    minmax(0, 1.08fr)
    minmax(420px, 0.92fr);
  align-items: center;
  gap: 84px;
}

.auth-intro {
  max-width: 660px;
}

.auth-intro__eyebrow {
  margin: 0 0 18px;
  color: #6ebdff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.auth-intro h1 {
  margin: 0;
  font-size:
    clamp(42px, 5vw, 68px);
  line-height: 1.14;
  letter-spacing: -0.04em;
}

.auth-intro__description {
  max-width: 590px;
  margin: 28px 0 0;
  color:
    rgba(255, 255, 255, 0.67);
  font-size: 17px;
  line-height: 1.9;
}

.feature-list {
  display: grid;
  margin-top: 42px;
  gap: 16px;
}

.feature-item {
  display: flex;
  max-width: 560px;
  padding: 16px 18px;
  border: 1px solid
    rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  align-items: center;
  gap: 16px;
  background:
    rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(8px);
}

.feature-item__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background:
    rgba(78, 136, 255, 0.17);
  color: #8fcaff;
  font-size: 12px;
  font-weight: 900;
}

.feature-item div:last-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.feature-item strong {
  font-size: 15px;
}

.feature-item span {
  color:
    rgba(255, 255, 255, 0.56);
  font-size: 13px;
}

.auth-panel {
  width: 100%;
}

.auth-panel__card {
  padding: 36px;
  border: 1px solid
    rgba(255, 255, 255, 0.28);
  border-radius: 26px;
  background:
    rgba(255, 255, 255, 0.96);
  box-shadow:
    0 28px 80px
    rgba(0, 0, 0, 0.32);
  color: #0f172a;
  backdrop-filter: blur(22px);
}

.auth-panel__security {
  margin: 18px 0 0;
  color:
    rgba(255, 255, 255, 0.48);
  font-size: 12px;
  text-align: center;
}

.auth-footer {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 28px;
  border-top: 1px solid
    rgba(255, 255, 255, 0.07);
  justify-content: space-between;
  gap: 16px;
  color:
    rgba(255, 255, 255, 0.38);
  font-size: 12px;
}

@media (max-width: 980px) {
  .auth-main {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .auth-intro {
    max-width: none;
  }

  .auth-panel {
    max-width: 560px;
  }
}

@media (max-width: 640px) {
  .auth-header {
    width: min(100% - 32px, 1240px);
    padding: 20px 0;
  }

  .auth-header__meta {
    display: none;
  }

  .auth-main {
    width: min(100% - 32px, 1240px);
    padding: 28px 0 52px;
  }

  .auth-intro h1 {
    font-size: 40px;
  }

  .auth-intro__description {
    font-size: 15px;
  }

  .feature-list {
    margin-top: 30px;
  }

  .auth-panel__card {
    padding: 24px;
    border-radius: 20px;
  }

  .auth-footer {
    width: min(100% - 32px, 1240px);
    flex-direction: column;
  }
}
</style>