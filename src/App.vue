<template>
  <div class="app-root">
    <!-- 1. 관리자 모드 대시보드 화면 (Alt + L 또는 모바일 사이드바 진입) -->
    <AdminDashboard 
      v-if="isAdminMode" 
      @logout="exitAdminMode" 
      @updatePassword="handleUpdatePassword"
    />

    <!-- 2. 일반 사용자 뉴스 메인 화면 -->
    <div v-else class="news-layout">
      <!-- 상단 헤더 영역 -->
      <header class="header">
        <div class="header-inner">
          <!-- 좌측: 모바일 햄버거 메뉴 버튼 + 로고 -->
          <div class="header-left">
            <!-- 햄버거 사이드바 트리거 버튼 (모바일 최적화) -->
            <button 
              class="hamburger-btn" 
              :class="{ open: isMobileSidebarOpen }"
              @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              aria-label="전체 메뉴 및 카테고리 열기"
              title="메뉴 열기"
            >
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>

            <!-- 로고 (클릭 시 메인 화면으로) -->
            <div class="brand" @click="goToHome">
              <LifeIcon :size="34" />
              <span class="brand-name">생활정보</span>
            </div>
          </div>

          <!-- 헤더 우측: 라이브 뱃지, 앱 설치 버튼, 프로필 아이콘 -->
          <div class="header-right">
            <!-- 실시간 동시 접속자 수 라이브 뱃지 -->
            <div class="live-traffic-tag">
              <span class="live-pulse-dot"></span>
              <span class="traffic-text-full">실시간 <strong>{{ activeUsers.toLocaleString() }}</strong>명 이용 중</span>
              <span class="traffic-text-compact"><strong>{{ (activeUsers / 10000).toFixed(1) }}만</strong>명</span>
            </div>
            
            <span class="header-date">{{ currentDateStr }}</span>

            <!-- 프로필 아이콘 및 드롭다운 메뉴 (로그인/회원가입 포함) -->
            <div class="profile-dropdown-wrapper" ref="profileDropdownRef">
              <button 
                class="profile-icon-btn" 
                :class="{ active: isProfileMenuOpen, logged: !!currentUser }"
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                title="내 프로필 및 계정"
              >
                <!-- 로그인 상태면 사용자 이름 첫 글자 아바타, 아니면 세련된 사용자 실루엣 SVG -->
                <span v-if="currentUser" class="profile-avatar-char">{{ currentUser.name.charAt(0) }}</span>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              <!-- 프로필 메뉴 드롭다운 -->
              <div v-if="isProfileMenuOpen" class="profile-menu-dropdown">
                <!-- 1. 로그인되어 있는 경우 -->
                <div v-if="currentUser" class="dropdown-user-info">
                  <div class="dropdown-user-header">
                    <div class="dropdown-avatar">{{ currentUser.name.charAt(0) }}</div>
                    <div class="dropdown-meta">
                      <strong class="dropdown-name">{{ currentUser.name }}</strong>
                      <span class="dropdown-email">{{ currentUser.email }}</span>
                      <span class="dropdown-role-badge">일반회원 (활동중)</span>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item profile" @click="goToProfile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    내 프로필 관리
                  </button>
                  <button class="dropdown-item logout" @click="handleDropdownLogout">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    로그아웃
                  </button>
                </div>

                <!-- 2. 로그인이 안 되어 있는 경우 (프로필 아이콘 안에 로그인/회원가입) -->
                <div v-else class="dropdown-guest-box">
                  <div class="guest-header">
                    <span class="guest-icon">👤</span>
                    <div>
                      <strong class="guest-title">생활정보 회원 서비스</strong>
                      <p class="guest-sub">로그인하고 맞춤 생활 정보를 확인하세요</p>
                    </div>
                  </div>
                  <div class="dropdown-action-btns">
                    <button class="dropdown-btn primary" @click="openAuthFromMenu('login')">
                      로그인
                    </button>
                    <button class="dropdown-btn secondary" @click="openAuthFromMenu('signup')">
                      회원가입
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 메뉴바 (8대 카테고리 - 데스크톱 및 모바일 가로 스크롤 지원) -->
      <nav class="navbar">
        <div class="navbar-inner">
          <ul class="nav-list">
            <li 
              v-for="nav in navItems" 
              :key="nav.id"
              :class="['nav-item', { active: selectedCategory === nav.id && currentPage === 'main' }]"
              @click="handleCategoryClick(nav.id)"
            >
              {{ nav.name }}
            </li>
          </ul>
        </div>
      </nav>

      <!-- 본문 영역: 매거진 뷰 또는 마이페이지 또는 로그인 페이지 -->
      <main class="content-area">
        <!-- 내 프로필 관리 페이지 -->
        <UserProfilePage 
          v-if="currentPage === 'profile'"
          @back="currentPage = 'main'"
          @withdrawn="handleWithdrawn"
        />

        <!-- 로그인/회원가입 페이지 (모달창 없음) -->
        <UserAuthPage 
          v-else-if="currentPage === 'auth'"
          :initialTab="authTab"
          @success="currentPage = 'main'"
          @cancel="currentPage = 'main'"
        />

        <!-- 뉴스 매거진 메인 화면 -->
        <NewsMagazine 
          v-else 
          :initialCategory="selectedCategory" 
          :key="selectedCategory" 
        />
      </main>

      <!-- 모바일 하단 네이티브 탭바 (요청 기능: 완전 앱 스타일) -->
      <MobileBottomNav 
        :currentView="currentPage"
        :isDrawerOpen="isMobileSidebarOpen"
        @navHome="goToHome"
        @toggleDrawer="isMobileSidebarOpen = !isMobileSidebarOpen"
        @installApp="triggerInstallApp"
        @navUser="handleBottomNavUser"
      />
    </div>

    <!-- 3. 모바일 햄버거 슬라이드 사이드바 (요청 기능) -->
    <MobileSidebar 
      :isOpen="isMobileSidebarOpen"
      :selectedCategory="selectedCategory"
      @close="isMobileSidebarOpen = false"
      @selectCategory="handleCategoryClick"
      @navigateAuth="goToAuth"
      @navigateProfile="goToProfile"
      @openAdminModal="isLoginModalOpen = true"
      @goMain="goToHome"
    />

    <!-- 4. PWA 앱 설치 바텀시트 / 모달 (요청 기능) -->
    <AppInstallModal 
      :isOpen="showInstallModal" 
      @close="showInstallModal = false"
    />

    <!-- 5. Alt+L 보안 관리자 비밀번호 입력 모달 (모바일 사이드바 버튼과도 연동) -->
    <AdminLoginModal 
      :isOpen="isLoginModalOpen" 
      :masterPassword="masterPassword"
      @close="isLoginModalOpen = false"
      @success="handleLoginSuccess"
    />

    <!-- 6. 실시간 사이트 자동 감시기 알림 배너 -->
    <AutoUpdateBanner />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LifeIcon from './components/LifeIcon.vue'
import AdminLoginModal from './components/AdminLoginModal.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import UserAuthPage from './components/UserAuthPage.vue'
import AutoUpdateBanner from './components/AutoUpdateBanner.vue'
import NewsMagazine from './components/NewsMagazine.vue'
import UserProfilePage from './components/UserProfilePage.vue'
import MobileSidebar from './components/MobileSidebar.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import AppInstallModal from './components/AppInstallModal.vue'
import { currentUser, logoutUser } from './composables/useAuth'
import { activeUsers } from './composables/useTraffic'
import { usePwaInstall } from './composables/usePwaInstall'

const currentDateStr = computed(() => {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
})

// 8대 카테고리 네비게이션
const navItems = [
  { id: 'all', name: '최신뉴스' },
  { id: 'politics', name: '정치' },
  { id: 'economy', name: '경제' },
  { id: 'society', name: '사회' },
  { id: 'world', name: '세계' },
  { id: 'health', name: '건강' },
  { id: 'sports', name: '스포츠' },
  { id: 'entertainment', name: '연예' }
]

const selectedCategory = ref('all')

// 모바일 햄버거 메뉴 상태
const isMobileSidebarOpen = ref(false)

// PWA 앱 설치 상태
const { showInstallModal, triggerInstallApp, isInstalled } = usePwaInstall()

function handleCategoryClick(catId) {
  selectedCategory.value = catId
  currentPage.value = 'main'
  isMobileSidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 홈으로 이동
function goToHome() {
  currentPage.value = 'main'
  selectedCategory.value = 'all'
  isMobileSidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 페이지 뷰 상태 ('main', 'auth', 'profile')
const currentPage = ref('main')
const authTab = ref('login')

// 관리자 모드 상태
const isAdminMode = ref(false)
const isLoginModalOpen = ref(false)
const masterPassword = ref('Life2026!@#Admin')

function goToAuth(tab) {
  authTab.value = tab
  currentPage.value = 'auth'
  isMobileSidebarOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleLogout() {
  logoutUser()
  currentPage.value = 'main'
  isMobileSidebarOpen.value = false
}

// 프로필 드롭다운 메뉴 상태
const isProfileMenuOpen = ref(false)
const profileDropdownRef = ref(null)

function openAuthFromMenu(tab) {
  isProfileMenuOpen.value = false
  goToAuth(tab)
}

function handleDropdownLogout() {
  isProfileMenuOpen.value = false
  handleLogout()
}

function goToProfile() {
  isProfileMenuOpen.value = false
  isMobileSidebarOpen.value = false
  currentPage.value = 'profile'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleBottomNavUser() {
  if (currentUser.value) {
    goToProfile()
  } else {
    goToAuth('login')
  }
}

function handleWithdrawn() {
  currentPage.value = 'main'
}

function handleClickOutside(e) {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) {
    isProfileMenuOpen.value = false
  }
}

// 전역 단축키 이벤트 리스너 (Alt + L)
function handleKeyDown(e) {
  if (e.altKey && (e.key === 'l' || e.key === 'L' || e.code === 'KeyL')) {
    e.preventDefault()
    if (isAdminMode.value) {
      isAdminMode.value = false
    } else {
      isLoginModalOpen.value = true
    }
  }

  if (e.key === 'Escape') {
    isProfileMenuOpen.value = false
    isMobileSidebarOpen.value = false
    if (isLoginModalOpen.value) {
      isLoginModalOpen.value = false
    } else if (isAdminMode.value) {
      isAdminMode.value = false
    } else if (currentPage.value === 'auth') {
      currentPage.value = 'main'
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('click', handleClickOutside)
})

function handleLoginSuccess() {
  isLoginModalOpen.value = false
  isAdminMode.value = true
}

function exitAdminMode() {
  isAdminMode.value = false
}

function handleUpdatePassword(newPw) {
  masterPassword.value = newPw
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Segoe UI", Roboto, sans-serif;
  background-color: #ffffff;
  color: #111827;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

.app-root {
  min-height: 100vh;
  background-color: #ffffff;
}

.news-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

@media (max-width: 768px) {
  .news-layout {
    /* 모바일 하단 네이티브 탭바 높이 확보 */
    padding-bottom: 74px;
  }
}

/* 상단 헤더 */
.header {
  border-bottom: 1px solid #f3f4f6;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 햄버거 메뉴 버튼 (PC 사이트에서는 절대 숨김, 모바일에서만 노출) */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  gap: 4px;
  padding: 8px;
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .hamburger-btn {
    display: flex;
  }
}

.hamburger-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.hamburger-bar {
  width: 18px;
  height: 2px;
  background-color: #1e293b;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.hamburger-btn.open .hamburger-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger-btn.open .hamburger-bar:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.open .hamburger-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.brand-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #0f172a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-date {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 900px) {
  .header-date {
    display: none;
  }
}

.live-traffic-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.traffic-text-compact {
  display: none;
}

@media (max-width: 600px) {
  .traffic-text-full {
    display: none;
  }
  .traffic-text-compact {
    display: inline;
  }
  .header-inner {
    padding: 10px 14px;
  }
  .brand-name {
    font-size: 19px;
  }
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 6px #22c55e;
  animation: pulseDot 1.5s infinite;
}

@keyframes pulseDot {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

/* 프로필 아이콘 및 드롭다운 */
.profile-dropdown-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.profile-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-icon-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.profile-icon-btn.active {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.profile-icon-btn.logged {
  background: #ecfdf5;
  border-color: #10b981;
  color: #047857;
}

.profile-avatar-char {
  font-size: 15px;
  font-weight: 800;
}

.profile-menu-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 270px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 14px 30px -6px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  padding: 18px;
  animation: dropDownFade 0.2s ease-out;
}

@keyframes dropDownFade {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 로그인된 경우 드롭다운 */
.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #059669;
  color: white;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.dropdown-email {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-role-badge {
  font-size: 10px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
  margin-top: 4px;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 14px 0 12px;
}

.dropdown-item.profile {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
  transition: all 0.15s ease;
}

.dropdown-item.profile:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.dropdown-item.logout {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #fef2f2;
  color: #ef4444;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s ease;
}

.dropdown-item.logout:hover {
  background: #fee2e2;
}

/* 게스트(로그인 전) 드롭다운 */
.guest-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.guest-icon {
  font-size: 20px;
  background: #f1f5f9;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guest-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}

.guest-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.3;
}

.dropdown-action-btns {
  display: flex;
  gap: 8px;
}

.dropdown-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease;
}

.dropdown-btn:hover {
  opacity: 0.9;
}

.dropdown-btn.primary {
  background: #059669;
  color: white;
}

.dropdown-btn.secondary {
  background: #0f172a;
  color: white;
}

/* 카테고리 네비바 */
.navbar {
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
  position: sticky;
  top: 67px;
  z-index: 50;
}

@media (max-width: 600px) {
  .navbar {
    top: 55px;
  }
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.navbar-inner::-webkit-scrollbar {
  display: none;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 4px;
  white-space: nowrap;
}

.nav-item {
  padding: 12px 14px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
}

@media (max-width: 480px) {
  .nav-item {
    padding: 10px 11px;
    font-size: 14px;
  }
}

.nav-item:hover {
  color: #059669;
}

.nav-item.active {
  color: #059669;
  font-weight: 800;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #059669;
  border-radius: 2px 2px 0 0;
}

/* 본문 영역 */
.content-area {
  flex: 1;
  background-color: #ffffff;
}
</style>
