<template>
  <div class="mobile-sidebar-root">
    <!-- 1. 배경 어두운 백드롭 (클릭 시 닫힘) -->
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="sidebar-backdrop" 
        @click="$emit('close')"
      ></div>
    </transition>

    <!-- 2. 슬라이드 사이드바 패널 (오프캔버스 드로어) -->
    <transition name="slide">
      <aside v-if="isOpen" class="sidebar-drawer">
        <!-- 상단 헤더: 로고 및 닫기 버튼 -->
        <div class="drawer-header">
          <div class="drawer-brand" @click="handleBrandClick">
            <LifeIcon :size="30" />
            <span class="brand-title">생활정보</span>
          </div>
          <button class="close-btn" @click="$emit('close')" title="메뉴 닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="drawer-scroll-body">
          <!-- 사용자 프로필 / 로그인 회원가입 카드 -->
          <div class="drawer-user-card">
            <!-- 1) 로그인된 회원 -->
            <div v-if="currentUser" class="user-logged-box">
              <div class="user-avatar-row">
                <div class="user-avatar-circle">{{ currentUser.name.charAt(0) }}</div>
                <div class="user-info-text">
                  <div class="user-name-badge">
                    <strong class="user-name">{{ currentUser.name }}</strong>
                    <span class="member-pill">정회원</span>
                  </div>
                  <span class="user-email">{{ currentUser.email }}</span>
                </div>
              </div>
              <div class="user-action-buttons">
                <button class="user-action-btn profile" @click="handleProfileClick">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  프로필 관리
                </button>
                <button class="user-action-btn logout" @click="handleLogoutClick">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  로그아웃
                </button>
              </div>
            </div>

            <!-- 2) 비로그인 게스트 -->
            <div v-else class="user-guest-box">
              <div class="guest-greeting">
                <div class="guest-icon-badge">👤</div>
                <div>
                  <strong class="guest-title">생활정보 회원 서비스</strong>
                  <p class="guest-sub">로그인하시면 맞춤 생활정보와 관심 뉴스를 저장할 수 있습니다.</p>
                </div>
              </div>
              <div class="guest-btn-group">
                <button class="guest-btn login" @click="handleAuthClick('login')">
                  로그인
                </button>
                <button class="guest-btn signup" @click="handleAuthClick('signup')">
                  회원가입
                </button>
              </div>
            </div>
          </div>

          <!-- PWA 앱 설치 프로모션 카드 (요청 기능) -->
          <div class="app-install-promo-card">
            <div class="install-card-left">
              <div class="app-mini-icon">
                <LifeIcon :size="24" />
              </div>
              <div class="install-texts">
                <strong class="install-title">{{ isInstalled ? '생활정보 앱 이용 중' : '생활정보 모바일 앱 설치' }}</strong>
                <p class="install-desc">{{ isInstalled ? '홈 화면에서 전체화면으로 실행 중' : '홈 화면에 추가하여 앱으로 빠르고 편리하게 이용하세요' }}</p>
              </div>
            </div>
            <button 
              class="install-trigger-btn" 
              :class="{ installed: isInstalled }"
              @click="handleInstallClick"
            >
              {{ isInstalled ? '✓ 설치됨' : '📲 앱 설치' }}
            </button>
          </div>

          <!-- 뉴스 카테고리 메뉴 목록 -->
          <div class="drawer-section">
            <h4 class="section-title">뉴스 카테고리</h4>
            <ul class="drawer-cat-list">
              <li 
                v-for="cat in categories" 
                :key="cat.id" 
                :class="['cat-item', { active: selectedCategory === cat.id }]"
                @click="handleCatClick(cat.id)"
              >
                <div class="cat-left">
                  <span class="cat-icon">{{ getCatIcon(cat.id) }}</span>
                  <span class="cat-name">{{ cat.name }}</span>
                </div>
                <div class="cat-right">
                  <span class="cat-count-badge">{{ getCategoryCount(cat.id) }}</span>
                  <span class="cat-arrow">›</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 사이드바 하단 푸터 -->
        <div class="drawer-footer">
          <p class="footer-copy">© 2026 생활정보 매거진 · Mobile PWA v2.6</p>
          <span class="footer-safe">24시간 자동감시 및 대용량 트래픽 보호 가동</span>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LifeIcon from './LifeIcon.vue'
import { currentUser, logoutUser } from '../composables/useAuth'
import { usePwaInstall } from '../composables/usePwaInstall'
import { articles, CATEGORIES } from '../services/newsService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  selectedCategory: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits([
  'close', 
  'selectCategory', 
  'navigateAuth', 
  'navigateProfile', 
  'goMain'
])

const { isInstalled, triggerInstallApp } = usePwaInstall()
const categories = CATEGORIES

const currentDateStr = computed(() => {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
})

function getCategoryCount(catId) {
  if (catId === 'all') return articles.value.length
  return articles.value.filter(a => a.category === catId).length
}

function getCatIcon(catId) {
  const iconMap = {
    all: '⚡',
    politics: '🏛️',
    economy: '📈',
    society: '🏙️',
    world: '🌍',
    health: '🩺',
    sports: '⚽',
    entertainment: '🎬'
  }
  return iconMap[catId] || '📰'
}

function handleBrandClick() {
  emit('goMain')
  emit('close')
}

function handleCatClick(catId) {
  emit('selectCategory', catId)
  emit('close')
}

function handleAuthClick(tab) {
  emit('navigateAuth', tab)
  emit('close')
}

function handleProfileClick() {
  emit('navigateProfile')
  emit('close')
}

function handleLogoutClick() {
  logoutUser()
  emit('close')
}

function handleInstallClick() {
  triggerInstallApp()
  emit('close')
}
</script>

<style scoped>
.mobile-sidebar-root {
  position: relative;
  z-index: 9999;
}

/* 1. 백드롭 (어두운 배경 오버레이) */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9998;
}

/* 2. 오프캔버스 드로어 */
.sidebar-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 84%;
  max-width: 360px;
  background: #ffffff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 30px rgba(0, 0, 0, 0.2);
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 드로어 헤더 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* 스크롤 가능한 본체 */
.drawer-scroll-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 유저 / 게스트 카드 */
.drawer-user-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
}

.user-avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.user-avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #059669;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info-text {
  flex: 1;
  overflow: hidden;
}

.user-name-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-pill {
  font-size: 10px;
  font-weight: 700;
  background: #ecfdf5;
  color: #059669;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #a7f3d0;
}

.user-email {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
  display: block;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-action-buttons {
  display: flex;
  gap: 8px;
}

.user-action-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.user-action-btn.profile {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e293b;
}

.user-action-btn.logout {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
}

/* 비로그인 게스트 */
.guest-greeting {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.guest-icon-badge {
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guest-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  display: block;
}

.guest-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 3px;
  line-height: 1.4;
}

.guest-btn-group {
  display: flex;
  gap: 8px;
}

.guest-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease;
}

.guest-btn.login {
  background: #059669;
  color: #ffffff;
}

.guest-btn.signup {
  background: #0f172a;
  color: #ffffff;
}

/* PWA 앱 설치 프로모션 카드 */
.app-install-promo-card {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  color: white;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(6, 78, 59, 0.25);
}

.install-card-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.app-mini-icon {
  background: white;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.install-texts {
  flex: 1;
}

.install-title {
  font-size: 13px;
  font-weight: 800;
  display: block;
}

.install-desc {
  font-size: 11px;
  color: #a7f3d0;
  margin-top: 2px;
  line-height: 1.3;
}

.install-trigger-btn {
  background: #10b981;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.15s ease;
}

.install-trigger-btn.installed {
  background: rgba(255,255,255,0.2);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.4);
}

/* 실시간 트래픽 뱃지 */
.live-status-pill {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #166534;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 6px #22c55e;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.live-date {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

/* 섹션 타이틀 */
.section-title {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-left: 4px;
}

/* 카테고리 리스트 */
.drawer-cat-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #ffffff;
}

.cat-item:hover {
  background: #f8fafc;
}

.cat-item.active {
  background: #ecfdf5;
  color: #059669;
  font-weight: 800;
}

.cat-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-icon {
  font-size: 16px;
}

.cat-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.cat-item.active .cat-name {
  color: #059669;
  font-weight: 800;
}

.cat-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-count-badge {
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 7px;
  border-radius: 12px;
}

.cat-item.active .cat-count-badge {
  background: #059669;
  color: #ffffff;
}

.cat-arrow {
  color: #cbd5e1;
  font-size: 16px;
  font-weight: bold;
}

.cat-item.active .cat-arrow {
  color: #059669;
}

/* 도구 리스트 */
.quick-tools-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-tool-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
  width: 100%;
}

.quick-tool-btn:hover {
  background: #f1f5f9;
}

.tool-icon {
  font-size: 18px;
}

.tool-info {
  display: flex;
  flex-direction: column;
}

.tool-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.tool-sub {
  font-size: 11px;
  color: #64748b;
}

.quick-tool-btn.admin {
  background: #fffbeb;
  border-color: #fde68a;
}

.quick-tool-btn.admin .tool-title {
  color: #b45309;
}

/* 푸터 */
.drawer-footer {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  text-align: center;
}

.footer-copy {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.footer-safe {
  font-size: 10px;
  color: #94a3b8;
  display: block;
  margin-top: 2px;
}

/* 슬라이드 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
