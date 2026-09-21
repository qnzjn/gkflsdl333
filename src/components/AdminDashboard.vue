<template>
  <div class="admin-layout">
    <!-- 관리자 상단 네비게이션 -->
    <header class="admin-header">
      <div class="header-left">
        <span class="admin-badge">ADMIN</span>
        <h2 class="admin-title">생활정보 관리자 콘솔</h2>
        <span class="system-status">● 자동 감시기 24h 가동 중</span>
      </div>
      <div class="header-right">
        <!-- 실시간 실제 온라인 접속자 요약 -->
        <div class="traffic-mini-badge online-users">
          <span class="pulse-dot green"></span>
          실제 온라인: <strong>{{ onlineSessions.length }}</strong>명
        </div>
        <button class="logout-btn" @click="$emit('logout')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          사용자 사이트로 나가기 (Esc)
        </button>
      </div>
    </header>

    <div class="admin-body">
      <!-- 주요 통계 카드 -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-meta">
            <span class="stat-label">현재 실제 온라인 접속자</span>
            <span class="stat-badge plus">실시간</span>
          </div>
          <div class="stat-value text-green">
            {{ onlineSessions.length }} <span class="stat-unit">명</span>
          </div>
          <div class="stat-desc">로그인 시 실시간 세션 자동 등록</div>
        </div>

        <div class="stat-card">
          <div class="stat-meta">
            <span class="stat-label">무인 자동 감시기 상태</span>
            <span class="stat-badge secure">100% 무인 자동</span>
          </div>
          <div class="stat-value text-green">실시간 감시 중</div>
          <div class="stat-desc">코드 수정 시 사용자 화면 자동 갱신</div>
        </div>

        <div class="stat-card">
          <div class="stat-meta">
            <span class="stat-label">총 가입 회원 수</span>
            <span class="stat-badge neutral">전체</span>
          </div>
          <div class="stat-value text-blue">{{ users.length }} <span class="stat-unit">명</span></div>
          <div class="stat-desc">등록된 모든 회원 계정</div>
        </div>

        <div class="stat-card">
          <div class="stat-meta">
            <span class="stat-label">대용량 트래픽 처리</span>
            <span class="stat-badge live">무중단</span>
          </div>
          <div class="stat-value text-green">{{ latency }} <span class="stat-unit">ms</span></div>
          <div class="stat-desc">캐시 적중률 {{ cacheHitRate }}%</div>
        </div>
      </section>

      <!-- 관리 영역 탭 -->
      <section class="management-section">
        <div class="section-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
          >
            {{ tab.name }}
            <span v-if="tab.id === 'liveUsers'" class="tab-count-badge live">{{ onlineSessions.length }}</span>
            <span v-if="tab.id === 'members'" class="tab-count-badge">{{ users.length }}</span>
            <span v-if="tab.id === 'watcher'" class="tab-count-badge auto">자동</span>
          </button>
        </div>

        <!-- 탭 1: 실시간 실제 접속자 모니터링 -->
        <div v-if="currentTab === 'liveUsers'" class="tab-content">
          <div class="content-toolbar">
            <div>
              <h3 class="traffic-heading">현재 사이트에 로그인하여 활동 중인 실제 접속자</h3>
              <p class="traffic-sub">메인 사이트에서 회원가입 및 로그인하면 여기에 실시간으로 즉시 표시됩니다.</p>
            </div>
            <div class="toolbar-info">
              실시간 온라인: <strong class="text-green">{{ onlineSessions.length }}</strong>명
            </div>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 60px;">상태</th>
                  <th style="width: 130px;">접속자 이름</th>
                  <th>이메일 / 계정</th>
                  <th style="width: 170px;">접속 기기 및 브라우저</th>
                  <th style="width: 140px;">접속 위치</th>
                  <th style="width: 140px;">접속 시간</th>
                  <th style="width: 160px;">현재 머무는 화면</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="onlineSessions.length === 0">
                  <td colspan="7" class="empty-cell">현재 로그인된 온라인 접속자가 없습니다.</td>
                </tr>
                <tr v-for="s in onlineSessions" :key="s.id">
                  <td>
                    <span class="live-dot-pulse" title="온라인 활동 중"></span>
                  </td>
                  <td class="user-name-cell">
                    <span class="user-avatar">{{ s.name.charAt(0) }}</span>
                    <strong>{{ s.name }}</strong>
                  </td>
                  <td class="email-cell">{{ s.email }}</td>
                  <td>{{ s.device }}</td>
                  <td>{{ s.location }}</td>
                  <td class="date-cell">{{ s.connectedAt }}</td>
                  <td>
                    <span class="page-tag">{{ s.currentPage }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 탭 2: 사이트 무인 자동 감시기 (버튼 클릭 필요 없음!) -->
        <div v-else-if="currentTab === 'watcher'" class="tab-content">
          <div class="watcher-container">
            <div class="watcher-card highlight">
              <div class="watcher-header">
                <div class="watcher-title-box">
                  <div class="watcher-icon">⚡</div>
                  <div>
                    <h3 class="watcher-title">무인 사이트 자동 감시기 (Zero-Click Auto Watcher)</h3>
                    <p class="watcher-sub">
                      <strong>버튼을 누르거나 링크를 다시 공유할 필요가 전혀 없습니다.</strong><br>
                      사이트 코드나 파일이 수정되면, <strong>기존에 접속해 있던 모든 사용자들의 브라우저가 변경을 3초 안에 스스로 감지하여 자동으로 최신 화면으로 바뀝니다.</strong>
                    </p>
                  </div>
                </div>
                <div class="auto-status-pill">
                  ● 무인 감시 활성 (3초 폴링)
                </div>
              </div>

              <!-- 실시간 감시 상태 박스 -->
              <div class="watcher-status-box">
                <div class="status-row">
                  <span class="status-label">최신 빌드 버전 식별자:</span>
                  <code class="status-value">{{ currentVersion || '연결 대기 중' }}</code>
                </div>
                <div class="status-row">
                  <span class="status-label">마지막 코드/사이트 갱신 시각:</span>
                  <span class="status-value">{{ lastUpdatedAt || '실시간 감시 중' }}</span>
                </div>
                <div class="status-row">
                  <span class="status-label">감시 방식:</span>
                  <span class="status-value text-green">HTTP no-store 3초 백그라운드 폴링 + 탭 복귀 자동 감지</span>
                </div>
              </div>

              <!-- 작동 방식 설명 카드 -->
              <div class="auto-flow-box">
                <h4 class="flow-title">💡 어떻게 자동으로 바뀌나요?</h4>
                <div class="flow-steps">
                  <div class="flow-step">
                    <span class="step-num">1</span>
                    <span class="step-text">관리자/개발자가 코드를 수정하거나 빌드함</span>
                  </div>
                  <div class="flow-arrow">➔</div>
                  <div class="flow-step">
                    <span class="step-num">2</span>
                    <span class="step-text">모든 사용자 브라우저의 자동 감시기가 변경 감지 (3초 이내)</span>
                  </div>
                  <div class="flow-arrow">➔</div>
                  <div class="flow-step">
                    <span class="step-num">3</span>
                    <span class="step-text">버튼 누를 필요 없이 <strong>스스로 최신 화면으로 자동 갱신!</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 탭 3: 회원정보 관리 탭 -->
        <div v-else-if="currentTab === 'members'" class="tab-content">
          <div class="content-toolbar">
            <div class="search-box">
              <input 
                type="text" 
                placeholder="회원 이름 또는 이메일 검색..." 
                class="admin-input" 
                v-model="userSearchQuery" 
              />
            </div>
            <div class="toolbar-info">
              전체 회원: <strong>{{ users.length }}</strong>명 / 검색 결과: <strong>{{ filteredUsers.length }}</strong>명
            </div>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 70px;">번호</th>
                  <th style="width: 120px;">이름(닉네임)</th>
                  <th>아이디 / 이메일</th>
                  <th style="width: 100px;">구분</th>
                  <th style="width: 130px;">접속 상태</th>
                  <th style="width: 150px;">가입 일시</th>
                  <th style="width: 150px;">최근 로그인</th>
                  <th style="width: 90px; text-align: center;">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="8" class="empty-cell">등록되거나 검색된 회원이 없습니다.</td>
                </tr>
                <tr v-for="(u, index) in filteredUsers" :key="u.id">
                  <td>{{ filteredUsers.length - index }}</td>
                  <td class="user-name-cell">
                    <span class="user-avatar">{{ u.name.charAt(0) }}</span>
                    {{ u.name }}
                  </td>
                  <td class="email-cell">{{ u.email }}</td>
                  <td>
                    <span class="role-badge">{{ u.role || '일반회원' }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', getStatusClass(u.status)]">
                      {{ u.status || '활동중' }}
                    </span>
                  </td>
                  <td class="date-cell">{{ u.createdAt }}</td>
                  <td class="date-cell">{{ u.lastLoginAt || '-' }}</td>
                  <td style="text-align: center;">
                    <button class="btn-action delete" @click="handleDeleteUser(u)">삭제</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 탭 4: 대용량 트래픽 관제실 -->
        <div v-else-if="currentTab === 'traffic'" class="tab-content">
          <div class="traffic-dashboard">
            <div class="traffic-control-bar">
              <div>
                <h3 class="traffic-heading">실시간 대용량 트래픽 관제 및 부하 분산</h3>
                <p class="traffic-sub">수만 명이 동시에 접속해도 서버 다운 없이 초고속으로 처리하는 대용량 구조입니다.</p>
              </div>
              <button 
                :class="['stress-toggle-btn', { active: isStressTesting }]"
                @click="toggleStressTest"
              >
                {{ isStressTesting ? '🔥 5만명 부하 테스트 중지' : '⚡ 5만명 대용량 트래픽 부하 발생시키기' }}
              </button>
            </div>

            <div class="chart-container">
              <div class="chart-header">
                <span class="chart-title">최근 실시간 트래픽 흐름 (실시간 갱신)</span>
                <span class="chart-now">현재 {{ activeUsers.toLocaleString() }}명 동시 접속 중</span>
              </div>
              <div class="chart-bars">
                <div 
                  v-for="(val, idx) in trafficHistory" 
                  :key="idx" 
                  class="chart-bar-wrap"
                >
                  <div 
                    class="chart-bar" 
                    :style="{ height: Math.min(100, Math.max(15, (val / 60000) * 100)) + '%' }"
                    :class="{ high: val > 30000 }"
                  ></div>
                  <span class="bar-val">{{ (val / 1000).toFixed(1) }}k</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 탭 5: 보안 및 마스터 비밀번호 -->
        <div v-else-if="currentTab === 'security'" class="tab-content">
          <div class="settings-card">
            <h3 class="settings-title">관리자 마스터 비밀번호 설정</h3>
            <p class="settings-desc">Alt+L 입력 시 요구되는 마스터 비밀번호를 변경합니다.</p>

            <div class="form-group">
              <label class="form-label">현재 비밀번호</label>
              <input type="password" v-model="currentPw" class="admin-input" />
            </div>

            <div class="form-group">
              <label class="form-label">새 강력 비밀번호</label>
              <input type="text" v-model="newPw" class="admin-input" placeholder="영문, 숫자, 특수문자 조합" />
              <button class="btn-generate" @click="generateStrongPw">🎲 추천 강력 비밀번호 자동 생성</button>
            </div>

            <button class="btn-primary" @click="savePassword">비밀번호 변경 저장</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { users, onlineSessions, removeUser } from '../composables/useAuth'
import { activeUsers, latency, cacheHitRate, isStressTesting, trafficHistory, toggleStressTest } from '../composables/useTraffic'
import { currentVersion, lastUpdatedAt } from '../composables/useAutoWatcher'

const emit = defineEmits(['logout', 'updatePassword'])

const tabs = [
  { id: 'liveUsers', name: '실시간 접속자' },
  { id: 'watcher', name: '사이트 자동 감시기' },
  { id: 'members', name: '회원정보 관리' },
  { id: 'traffic', name: '대용량 트래픽 관제' },
  { id: 'security', name: '보안 설정' }
]

const currentTab = ref('liveUsers')
const userSearchQuery = ref('')

const currentPw = ref('')
const newPw = ref('')

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  const q = userSearchQuery.value.toLowerCase()
  return users.value.filter(u => 
    (u.name && u.name.toLowerCase().includes(q)) || 
    (u.email && u.email.toLowerCase().includes(q))
  )
})

function getStatusClass(status) {
  if (!status) return 'neutral'
  if (status.includes('온라인') || status.includes('방금')) return 'online'
  if (status.includes('활동')) return 'active'
  return 'offline'
}

function handleDeleteUser(user) {
  if (confirm(`'${user.name}' 회원을 강제 삭제하시겠습니까?`)) {
    removeUser(user.id)
  }
}

function generateStrongPw() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  newPw.value = result
}

function savePassword() {
  if (!newPw.value) {
    alert('새 비밀번호를 입력해 주세요.')
    return
  }
  emit('updatePassword', newPw.value)
  alert('관리자 마스터 비밀번호가 변경되었습니다: ' + newPw.value)
  newPw.value = ''
  currentPw.value = ''
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Segoe UI", Roboto, sans-serif;
}

/* 관리자 헤더 */
.admin-header {
  background: #0f172a;
  color: #ffffff;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1e293b;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-badge {
  background: #059669;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.admin-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.system-status {
  font-size: 12px;
  color: #34d399;
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.traffic-mini-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.pulse-dot.green {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulseAnim 1.5s infinite;
}

.live-dot-pulse {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulseAnim 1.5s infinite;
}

@keyframes pulseAnim {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.admin-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

/* 통계 카드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.stat-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-badge.plus { background: #ecfdf5; color: #059669; }
.stat-badge.secure { background: #ecfdf5; color: #047857; }
.stat-badge.live { background: #eff6ff; color: #2563eb; }
.stat-badge.neutral { background: #f1f5f9; color: #475569; }

.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
}

.stat-unit {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

.stat-value.text-green { color: #059669; }
.stat-value.text-blue { color: #2563eb; }

.stat-desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
}

/* 탭 메뉴 */
.management-section {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.section-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-btn {
  padding: 14px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.tab-btn.active {
  color: #059669;
  border-bottom-color: #059669;
  background: #ffffff;
}

.tab-count-badge {
  font-size: 11px;
  background: #e2e8f0;
  color: #475569;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.tab-count-badge.live {
  background: #dcfce7;
  color: #15803d;
}

.tab-count-badge.auto {
  background: #dbeafe;
  color: #1d4ed8;
}

.tab-content {
  padding: 24px;
}

/* 자동 감시기 스타일 */
.watcher-card.highlight {
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  padding: 24px;
}

.watcher-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.watcher-title-box {
  display: flex;
  gap: 14px;
}

.watcher-icon {
  font-size: 32px;
  background: #ecfdf5;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.watcher-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.watcher-sub {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.6;
}

.auto-status-pill {
  background: #059669;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.watcher-status-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  width: 180px;
  font-weight: 600;
  color: #475569;
}

.status-value {
  font-weight: 700;
  color: #0f172a;
}

.status-value.text-green {
  color: #059669;
}

.auto-flow-box {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 18px;
}

.flow-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
}

.flow-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #059669;
  color: white;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-text {
  font-size: 13px;
  color: #334155;
}

.flow-arrow {
  color: #94a3b8;
  font-weight: 700;
}

/* 테이블 공통 */
.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table th {
  background: #f8fafc;
  padding: 12px 14px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.admin-table td {
  padding: 14px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.empty-cell {
  text-align: center;
  padding: 40px !important;
  color: #94a3b8;
}

.user-name-cell {
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #059669;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.email-cell {
  font-family: monospace;
  color: #475569;
}

.page-tag {
  background: #f1f5f9;
  color: #334155;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.role-badge {
  font-size: 12px;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.status-badge.online { background: #ecfdf5; color: #059669; }
.status-badge.active { background: #f0fdf4; color: #16a34a; }
.status-badge.offline { background: #f8fafc; color: #94a3b8; }

.date-cell {
  font-size: 13px;
  color: #94a3b8;
}

.btn-action {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-action.delete {
  background: #fef2f2;
  color: #ef4444;
}

.btn-action.delete:hover {
  background: #fee2e2;
}

/* 폼 스타일 */
.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
  max-width: 320px;
}

.toolbar-info {
  font-size: 13px;
  color: #64748b;
}

.admin-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
}

.admin-input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15);
}

.btn-primary {
  padding: 10px 18px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #047857;
}

.settings-card {
  max-width: 600px;
}

.settings-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.settings-desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.btn-generate {
  margin-top: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-generate:hover {
  background: #e2e8f0;
}

/* 트래픽 관제실 차트 */
.traffic-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.traffic-heading {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.traffic-sub {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.stress-toggle-btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: #059669;
  color: white;
}

.stress-toggle-btn.active {
  background: #ef4444;
}

.chart-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.chart-now {
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
}

.chart-bars {
  height: 140px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-top: 20px;
  border-bottom: 2px solid #cbd5e1;
}

.chart-bar-wrap {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.chart-bar {
  width: 100%;
  background: #3b82f6;
  border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-bar.high {
  background: #ef4444;
}

.bar-val {
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}
</style>
