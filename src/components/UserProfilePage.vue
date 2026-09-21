<template>
  <div class="profile-page-container">
    <div class="profile-card-wrapper">
      <!-- 상단 네비게이션 -->
      <div class="profile-header-nav">
        <button class="back-link" @click="$emit('back')">
          ← 메인 뉴스로 돌아가기
        </button>
        <span class="page-category">마이페이지</span>
      </div>

      <!-- 프로필 메인 카드 -->
      <div class="profile-main-card">
        <div class="user-hero">
          <div class="user-avatar-large">
            {{ currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div class="user-hero-meta">
            <div class="user-name-row">
              <h2 class="user-name">{{ currentUser?.name }}</h2>
              <span class="status-chip online">● 온라인 활동 중</span>
            </div>
            <p class="user-email">{{ currentUser?.email }}</p>
            <div class="user-badges">
              <span class="badge role">{{ currentUser?.role || '일반회원' }}</span>
              <span class="badge join-date">가입일: {{ currentUser?.createdAt }}</span>
            </div>
          </div>
        </div>

        <!-- 활동 통계 그리드 -->
        <div class="activity-grid">
          <div class="act-card">
            <span class="act-val">12</span>
            <span class="act-label">오늘 읽은 생활 뉴스</span>
          </div>
          <div class="act-card">
            <span class="act-val">4</span>
            <span class="act-label">북마크한 꿀팁 기사</span>
          </div>
          <div class="act-card">
            <span class="act-val">정상</span>
            <span class="act-label">계정 보안 등급</span>
          </div>
        </div>
      </div>

      <!-- 프로필 정보 수정 폼 -->
      <div class="settings-box">
        <h3 class="section-title">회원 정보 수정</h3>
        <p class="section-desc">닉네임(이름) 또는 비밀번호를 변경할 수 있습니다.</p>

        <form @submit.prevent="handleUpdateProfile" class="edit-form">
          <div class="form-group">
            <label class="form-label">이메일 (아이디)</label>
            <input type="text" :value="currentUser?.email" class="form-input disabled" disabled />
            <span class="input-hint">이메일 계정은 변경할 수 없습니다.</span>
          </div>

          <div class="form-group">
            <label class="form-label">이름 (닉네임)</label>
            <input type="text" v-model="editName" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">새 비밀번호 (선택 사항)</label>
            <input 
              type="password" 
              v-model="editPassword" 
              placeholder="변경할 새 비밀번호 입력 (4자 이상)" 
              class="form-input" 
              minlength="4"
            />
          </div>

          <button type="submit" class="save-btn">
            프로필 정보 수정 저장
          </button>
        </form>
      </div>

      <!-- 위험 구역: 회원 탈퇴 -->
      <div class="danger-zone-card">
        <div class="danger-info">
          <h4 class="danger-title">회원 탈퇴</h4>
          <p class="danger-desc">
            회원 탈퇴 시 등록된 계정 정보와 저장된 데이터가 영구적으로 삭제되며 즉시 복구할 수 없습니다.
          </p>
        </div>
        <button class="withdraw-btn" @click="handleWithdraw">
          회원 탈퇴하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { currentUser, updateUserProfile, withdrawAccount } from '../composables/useAuth'

const emit = defineEmits(['back', 'withdrawn'])

const editName = ref('')
const editPassword = ref('')

onMounted(() => {
  if (currentUser.value) {
    editName.value = currentUser.value.name
  }
})

function handleUpdateProfile() {
  if (!editName.value.trim()) {
    alert('이름을 입력해 주세요.')
    return
  }

  try {
    updateUserProfile(currentUser.value.id, {
      name: editName.value.trim(),
      password: editPassword.value ? editPassword.value : undefined
    })
    alert('🎉 프로필 정보가 성공적으로 수정되었습니다!')
    editPassword.value = ''
  } catch (err) {
    alert(err.message)
  }
}

function handleWithdraw() {
  const confirmMsg = `정말 탈퇴하시겠습니까?\n\n탈퇴 시 [${currentUser.value.name}]님의 계정 정보와 로그인 권한이 완전히 삭제됩니다.`
  if (confirm(confirmMsg)) {
    const secondConfirm = confirm('탈퇴 후에는 복구할 수 없습니다. 정말로 회원 탈퇴를 진행할까요?')
    if (secondConfirm) {
      withdrawAccount(currentUser.value.id)
      alert('회원 탈퇴가 안전하게 처리되었습니다. 그동안 생활정보 서비스를 이용해 주셔서 감사합니다.')
      emit('withdrawn')
    }
  }
}
</script>

<style scoped>
.profile-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px 80px;
}

.profile-card-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  background: none;
  border: none;
  color: #059669;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.back-link:hover {
  text-decoration: underline;
}

.page-category {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

/* 1. 메인 프로필 카드 */
.profile-main-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}

.user-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.user-avatar-large {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #059669;
  color: white;
  font-size: 28px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  flex-shrink: 0;
}

.user-hero-meta {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.user-name {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.status-chip.online {
  font-size: 11px;
  font-weight: 700;
  background: #ecfdf5;
  color: #059669;
  padding: 3px 8px;
  border-radius: 20px;
}

.user-email {
  font-size: 13px;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 10px;
}

.user-badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge.role {
  background: #f1f5f9;
  color: #334155;
}

.badge.join-date {
  background: #f8fafc;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
}

/* 활동 그리드 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 600px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }
}

.act-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}

.act-val {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: #059669;
}

.act-label {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

/* 2. 설정 박스 */
.settings-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.section-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
}

.form-input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15);
}

.form-input.disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.input-hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  display: block;
}

.save-btn {
  padding: 12px 24px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.save-btn:hover {
  background: #047857;
}

/* 3. 위험 구역 (회원 탈퇴) */
.danger-zone-card {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

@media (max-width: 600px) {
  .danger-zone-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.danger-title {
  font-size: 16px;
  font-weight: 800;
  color: #c53030;
}

.danger-desc {
  font-size: 13px;
  color: #742a2a;
  margin-top: 4px;
  line-height: 1.5;
}

.withdraw-btn {
  padding: 11px 20px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.withdraw-btn:hover {
  background: #c53030;
}
</style>
