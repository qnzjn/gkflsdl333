<template>
  <nav class="mobile-bottom-nav">
    <div class="bottom-nav-inner">
      <!-- 1. 홈 탭 -->
      <button 
        class="nav-tab-btn" 
        :class="{ active: currentView === 'main' && !isDrawerOpen }"
        @click="$emit('navHome')"
      >
        <span class="tab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span class="tab-label">홈</span>
      </button>

      <!-- 2. 카테고리 탭 (햄버거 사이드바 토글) -->
      <button 
        class="nav-tab-btn" 
        :class="{ active: isDrawerOpen }"
        @click="$emit('toggleDrawer')"
      >
        <span class="tab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </span>
        <span class="tab-label">카테고리</span>
      </button>

      <!-- 3. 앱 설치 탭 -->
      <button 
        class="nav-tab-btn highlight" 
        :class="{ installed: isInstalled }"
        @click="$emit('installApp')"
      >
        <span class="tab-icon app-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          <span v-if="!isInstalled" class="install-pulse-dot"></span>
        </span>
        <span class="tab-label">{{ isInstalled ? '앱 실행중' : '앱 설치' }}</span>
      </button>

      <!-- 4. 내 정보 탭 -->
      <button 
        class="nav-tab-btn" 
        :class="{ active: currentView === 'profile' || currentView === 'auth' }"
        @click="$emit('navUser')"
      >
        <span class="tab-icon">
          <!-- 로그인 시 아바타 문자 표시 -->
          <span v-if="currentUser" class="tab-avatar-char">{{ currentUser.name.charAt(0) }}</span>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="tab-label">{{ currentUser ? '내 프로필' : '로그인' }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { currentUser } from '../composables/useAuth'
import { usePwaInstall } from '../composables/usePwaInstall'

defineProps({
  currentView: {
    type: String,
    default: 'main'
  },
  isDrawerOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['navHome', 'toggleDrawer', 'installApp', 'navUser'])

const { isInstalled } = usePwaInstall()
</script>

<style scoped>
.mobile-bottom-nav {
  display: none; /* 데스크톱에서는 숨김 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid #e2e8f0;
  z-index: 900;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 8px);
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: block;
  }
}

.bottom-nav-inner {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  padding: 0 8px;
}

.nav-tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.15s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.tab-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.tab-label {
  font-size: 11px;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: -0.3px;
}

.nav-tab-btn.active {
  color: #059669;
}

.nav-tab-btn.active .tab-label {
  font-weight: 800;
}

.tab-avatar-char {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #059669;
  color: white;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 앱 설치 탭 하이라이트 */
.nav-tab-btn.highlight {
  color: #059669;
}

.nav-tab-btn.highlight .tab-label {
  font-weight: 700;
}

.install-pulse-dot {
  position: absolute;
  top: -2px;
  right: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #ef4444;
  box-shadow: 0 0 6px #ef4444;
}

.nav-tab-btn.highlight.installed {
  color: #64748b;
}

.nav-tab-btn.highlight.installed .install-pulse-dot {
  display: none;
}
</style>
