<template>
  <div class="auth-page-container">
    <div class="auth-box">
      <!-- 상단 탭 (로그인 / 회원가입 / 이메일 찾기 / 비밀번호 찾기) -->
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: currentTab === 'login' }]"
          @click="switchTab('login')"
        >
          로그인
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'signup' }]"
          @click="switchTab('signup')"
        >
          회원가입
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'findEmail' }]"
          @click="switchTab('findEmail')"
        >
          이메일 찾기
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'findPw' }]"
          @click="switchTab('findPw')"
        >
          비밀번호 찾기
        </button>
      </div>

      <!-- 글로벌 에러 알림 -->
      <div v-if="globalError" class="error-banner">
        {{ globalError }}
      </div>

      <!-- 1. 로그인 폼 -->
      <form v-if="currentTab === 'login'" @submit.prevent="handleLogin" class="form-content">
        <div class="form-group">
          <label class="form-label">이메일 (아이디)</label>
          <input 
            type="email" 
            v-model="loginForm.email" 
            placeholder="example@naver.com" 
            class="input-control" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">비밀번호</label>
          <input 
            type="password" 
            v-model="loginForm.password" 
            placeholder="비밀번호 입력" 
            class="input-control" 
            required 
          />
        </div>

        <button type="submit" class="action-btn login">
          생활정보 로그인
        </button>

        <div class="bottom-links">
          <button type="button" class="text-link" @click="switchTab('findEmail')">이메일 찾기</button>
          <span class="sep">|</span>
          <button type="button" class="text-link" @click="switchTab('findPw')">비밀번호 찾기</button>
          <span class="sep">|</span>
          <button type="button" class="text-link" @click="switchTab('signup')">회원가입</button>
        </div>

        <div class="home-back-row">
          <button type="button" class="back-home-btn" @click="$emit('cancel')">
            ← 메인 뉴스로 돌아가기
          </button>
        </div>
      </form>

      <!-- 2. 회원가입 폼 (버튼 없는 실시간 중복검사 + 강력한 비밀번호) -->
      <form v-else-if="currentTab === 'signup'" @submit.prevent="handleSignup" class="form-content">
        <!-- 닉네임 입력 (버튼 없이 실시간 자동 검사) -->
        <div class="form-group">
          <label class="form-label">이름 (닉네임)</label>
          <input 
            type="text" 
            v-model="signupForm.name" 
            placeholder="2자 이상 닉네임 입력" 
            class="input-control" 
            :class="nameValidation.class"
            required 
          />
          <div v-if="signupForm.name" :class="['validation-msg', nameValidation.type]">
            {{ nameValidation.message }}
          </div>
        </div>

        <!-- 이메일 입력 (버튼 없이 실시간 자동 검사) -->
        <div class="form-group">
          <label class="form-label">이메일 (아이디로 사용)</label>
          <input 
            type="email" 
            v-model="signupForm.email" 
            placeholder="example@naver.com" 
            class="input-control" 
            :class="emailValidation.class"
            required 
          />
          <div v-if="signupForm.email" :class="['validation-msg', emailValidation.type]">
            {{ emailValidation.message }}
          </div>
        </div>

        <!-- 강력한 비밀번호 입력 (실시간 강도 체크 & 체크리스트) -->
        <div class="form-group">
          <div class="label-with-badge">
            <label class="form-label">비밀번호</label>
            <span v-if="signupForm.password" :class="['strength-pill', pwStrength.level]">
              {{ pwStrength.label }}
            </span>
          </div>
          <input 
            type="password" 
            v-model="signupForm.password" 
            placeholder="8자 이상, 영문+숫자+특수문자 필수" 
            class="input-control" 
            :class="pwValidation.class"
            required 
          />
          <!-- 비밀번호 강도 게이지 바 -->
          <div v-if="signupForm.password" class="strength-bar-track">
            <div class="strength-bar-fill" :style="{ width: pwStrength.percent + '%', backgroundColor: pwStrength.color }"></div>
          </div>
          <!-- 필수 조건 체크리스트 칩 -->
          <div class="pw-rules-row">
            <span :class="['rule-chip', { ok: pwRules.length }]">8자 이상</span>
            <span :class="['rule-chip', { ok: pwRules.letter }]">영문 포함</span>
            <span :class="['rule-chip', { ok: pwRules.number }]">숫자 포함</span>
            <span :class="['rule-chip', { ok: pwRules.special }]">특수문자(!@#$%)</span>
          </div>
        </div>

        <!-- 비밀번호 확인 입력 -->
        <div class="form-group">
          <label class="form-label">비밀번호 확인</label>
          <input 
            type="password" 
            v-model="signupForm.confirmPassword" 
            placeholder="비밀번호를 다시 한 번 입력하세요" 
            class="input-control" 
            :class="confirmPwValidation.class"
            required 
          />
          <div v-if="signupForm.confirmPassword" :class="['validation-msg', confirmPwValidation.type]">
            {{ confirmPwValidation.message }}
          </div>
        </div>

        <button 
          type="submit" 
          class="action-btn signup" 
          :disabled="!isSignupValid"
        >
          {{ isSignupValid ? '회원가입 완료하기' : '위 항목을 올바르게 완성해 주세요' }}
        </button>

        <div class="bottom-links">
          <span>이미 계정이 있으신가요?</span>
          <button type="button" class="text-link highlight" @click="switchTab('login')">로그인하기</button>
        </div>

        <div class="home-back-row">
          <button type="button" class="back-home-btn" @click="$emit('cancel')">
            ← 메인 뉴스로 돌아가기
          </button>
        </div>
      </form>

      <!-- 3. 이메일 찾기 폼 (닉네임 입력 시 등록된 이메일 전체보기) -->
      <div v-else-if="currentTab === 'findEmail'" class="form-content">
        <div class="tab-intro">
          <h3 class="tab-intro-title">🔍 이메일(아이디) 찾기</h3>
          <p class="tab-intro-desc">가입 시 등록하신 <strong>이름(닉네임)</strong>을 입력하시면 이메일 전체 주소를 바로 알려드립니다.</p>
        </div>

        <div class="form-group">
          <label class="form-label">가입자 이름 (닉네임)</label>
          <input 
            type="text" 
            v-model="findEmailQuery" 
            placeholder="가입했던 이름 입력 (예: 홍길동, 김민준)" 
            class="input-control" 
            @keyup.enter="handleFindEmail"
          />
        </div>

        <button type="button" class="action-btn find" @click="handleFindEmail">
          등록된 이메일 전체 찾기
        </button>

        <!-- 이메일 검색 결과 박스 (이메일 전체보기) -->
        <div v-if="foundEmailResults !== null" class="result-box">
          <div v-if="foundEmailResults.length === 0" class="no-result">
            ⚠️ 해당 이름으로 등록된 회원 계정이 없습니다.
          </div>
          <div v-else class="found-list">
            <div class="found-label">🎉 등록된 계정을 찾았습니다:</div>
            <div v-for="user in foundEmailResults" :key="user.id" class="found-card">
              <div class="found-user-info">
                <strong>{{ user.name }}</strong> 님의 아이디
              </div>
              <div class="found-email-val">
                {{ user.email }}
              </div>
              <button class="quick-login-btn" @click="fillLoginAndSwitch(user.email)">
                이 이메일로 바로 로그인하기 →
              </button>
            </div>
          </div>
        </div>

        <div class="bottom-links">
          <button type="button" class="text-link" @click="switchTab('login')">로그인으로 돌아가기</button>
          <span class="sep">|</span>
          <button type="button" class="text-link" @click="switchTab('findPw')">비밀번호 찾기</button>
        </div>

        <div class="home-back-row">
          <button type="button" class="back-home-btn" @click="$emit('cancel')">
            ← 메인 뉴스로 돌아가기
          </button>
        </div>
      </div>

      <!-- 4. 비밀번호 찾기 폼 (자동 임시 비밀번호 발급) -->
      <div v-else-if="currentTab === 'findPw'" class="form-content">
        <div class="tab-intro">
          <h3 class="tab-intro-title">🔑 비밀번호 찾기 & 임시 비밀번호 발급</h3>
          <p class="tab-intro-desc">가입하신 <strong>이메일 주소</strong>를 입력하시면 강력한 임시 비밀번호를 즉시 자동 생성해 드립니다.</p>
        </div>

        <div class="form-group">
          <label class="form-label">가입 이메일 주소</label>
          <input 
            type="email" 
            v-model="findPwEmail" 
            placeholder="example@naver.com" 
            class="input-control" 
            @keyup.enter="handleGenerateTempPw"
          />
        </div>

        <button type="button" class="action-btn find" @click="handleGenerateTempPw">
          강력한 임시 비밀번호 자동 발급
        </button>

        <!-- 임시 비밀번호 발급 완료 박스 -->
        <div v-if="tempPasswordResult" class="temp-pw-box">
          <div class="temp-header">
            <span class="temp-icon">🎉</span>
            <div>
              <strong class="temp-user">{{ tempPasswordResult.user.name }}님</strong>의 임시 비밀번호 발급 완료!
            </div>
          </div>
          <div class="temp-code-row">
            <code class="temp-pw-code">{{ tempPasswordResult.tempPassword }}</code>
            <button class="copy-pw-btn" @click="copyTempPw">
              {{ copiedTemp ? '복사 완료!' : '비번 복사' }}
            </button>
          </div>
          <p class="temp-notice">
            💡 보안을 위해 로그인 후 <strong>[내 프로필 관리]</strong>에서 원하는 비밀번호로 변경해 주세요.
          </p>
          <button class="auto-login-btn" @click="fillLoginWithTemp">
            이 임시 비밀번호로 즉시 로그인하기 →
          </button>
        </div>

        <div class="bottom-links">
          <button type="button" class="text-link" @click="switchTab('login')">로그인으로 돌아가기</button>
          <span class="sep">|</span>
          <button type="button" class="text-link" @click="switchTab('findEmail')">이메일 찾기</button>
        </div>

        <div class="home-back-row">
          <button type="button" class="back-home-btn" @click="$emit('cancel')">
            ← 메인 뉴스로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  registerUser, 
  loginUser, 
  isNameTaken, 
  isEmailTaken, 
  findEmailByName, 
  generateTempPassword 
} from '../composables/useAuth'

const props = defineProps({
  initialTab: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['success', 'cancel'])

const currentTab = ref(props.initialTab)
const globalError = ref('')

// 로그인 폼 상태
const loginForm = reactive({
  email: '',
  password: ''
})

// 회원가입 폼 상태
const signupForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 이메일 찾기 상태
const findEmailQuery = ref('')
const foundEmailResults = ref(null)

// 비밀번호 찾기 상태
const findPwEmail = ref('')
const tempPasswordResult = ref(null)
const copiedTemp = ref(false)

function switchTab(tab) {
  currentTab.value = tab
  globalError.value = ''
}

// 1. 닉네임 실시간 중복 검사 (버튼 없음)
const nameValidation = computed(() => {
  const name = signupForm.name.trim()
  if (!name) return { type: '', message: '', class: '' }
  if (name.length < 2) {
    return { type: 'error', message: '⚠️ 닉네임은 2자 이상 입력해 주세요.', class: 'is-invalid' }
  }
  if (isNameTaken(name)) {
    return { type: 'error', message: '✕ 이미 다른 회원이 사용 중인 닉네임입니다.', class: 'is-invalid' }
  }
  return { type: 'success', message: '✓ 사용 가능한 멋진 닉네임입니다.', class: 'is-valid' }
})

// 2. 이메일 실시간 중복 검사 (버튼 없음)
const emailValidation = computed(() => {
  const email = signupForm.email.trim()
  if (!email) return { type: '', message: '', class: '' }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { type: 'error', message: '⚠️ 올바른 이메일 형식을 입력하세요 (예: user@naver.com)', class: 'is-invalid' }
  }
  if (isEmailTaken(email)) {
    return { type: 'error', message: '✕ 이미 가입되어 있는 이메일 주소입니다.', class: 'is-invalid' }
  }
  return { type: 'success', message: '✓ 가입 가능한 깨끗한 이메일입니다.', class: 'is-valid' }
})

// 3. 비밀번호 강도 & 규칙 검증
const pwRules = computed(() => {
  const pw = signupForm.password
  return {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)
  }
})

const pwStrength = computed(() => {
  const pw = signupForm.password
  if (!pw) return { level: 'none', label: '', percent: 0, color: '#e2e8f0' }
  
  let score = 0
  if (pwRules.value.length) score++
  if (pwRules.value.letter) score++
  if (pwRules.value.number) score++
  if (pwRules.value.special) score++

  if (score <= 2) {
    return { level: 'weak', label: '취약', percent: 33, color: '#ef4444' }
  } else if (score === 3) {
    return { level: 'medium', label: '보통', percent: 66, color: '#f59e0b' }
  } else {
    return { level: 'strong', label: '강력함', percent: 100, color: '#10b981' }
  }
})

const pwValidation = computed(() => {
  const pw = signupForm.password
  if (!pw) return { class: '' }
  if (pwStrength.value.level === 'strong') {
    return { class: 'is-valid' }
  }
  return { class: 'is-invalid' }
})

// 4. 비밀번호 확인 일치 여부
const confirmPwValidation = computed(() => {
  const confirm = signupForm.confirmPassword
  if (!confirm) return { type: '', message: '', class: '' }
  if (confirm === signupForm.password) {
    return { type: 'success', message: '✓ 비밀번호가 완벽하게 일치합니다.', class: 'is-valid' }
  }
  return { type: 'error', message: '✕ 비밀번호가 일치하지 않습니다.', class: 'is-invalid' }
})

// 회원가입 버튼 활성화 여부
const isSignupValid = computed(() => {
  return (
    nameValidation.value.type === 'success' &&
    emailValidation.value.type === 'success' &&
    pwStrength.value.level === 'strong' &&
    confirmPwValidation.value.type === 'success'
  )
})

// 로그인 처리
function handleLogin() {
  try {
    globalError.value = ''
    loginUser(loginForm.email, loginForm.password)
    emit('success')
  } catch (err) {
    globalError.value = err.message
  }
}

// 회원가입 처리
function handleSignup() {
  if (!isSignupValid.value) {
    globalError.value = '모든 항목을 올바르게 입력해 주세요.'
    return
  }

  try {
    globalError.value = ''
    registerUser(signupForm.name.trim(), signupForm.email.trim(), signupForm.password)
    alert(`🎉 ${signupForm.name}님, 회원가입이 완료되었습니다! 로그인 상태로 시작합니다.`)
    emit('success')
  } catch (err) {
    globalError.value = err.message
  }
}

// 이메일 찾기 처리
function handleFindEmail() {
  if (!findEmailQuery.value.trim()) {
    alert('이름(닉네임)을 입력해 주세요.')
    return
  }
  foundEmailResults.value = findEmailByName(findEmailQuery.value.trim())
}

function fillLoginAndSwitch(email) {
  loginForm.email = email
  switchTab('login')
}

// 임시 비밀번호 발급 처리
function handleGenerateTempPw() {
  try {
    globalError.value = ''
    tempPasswordResult.value = generateTempPassword(findPwEmail.value)
    copiedTemp.value = false
  } catch (err) {
    globalError.value = err.message
    tempPasswordResult.value = null
  }
}

function copyTempPw() {
  if (tempPasswordResult.value) {
    navigator.clipboard.writeText(tempPasswordResult.value.tempPassword)
    copiedTemp.value = true
    setTimeout(() => { copiedTemp.value = false }, 2000)
  }
}

function fillLoginWithTemp() {
  if (tempPasswordResult.value) {
    loginForm.email = tempPasswordResult.value.user.email
    loginForm.password = tempPasswordResult.value.tempPassword
    copyTempPw()
    switchTab('login')
  }
}
</script>

<style scoped>
.auth-page-container {
  padding: 40px 20px 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #ffffff;
}

.auth-box {
  width: 100%;
  max-width: 460px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.auth-tabs {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 14px 6px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.tab-btn.active {
  color: #059669;
  border-bottom-color: #059669;
  background: #ffffff;
  font-weight: 800;
}

.error-banner {
  background: #fef2f2;
  color: #ef4444;
  font-size: 13px;
  padding: 12px 16px;
  border-bottom: 1px solid #fee2e2;
  text-align: center;
  font-weight: 600;
}

.form-content {
  padding: 28px 24px;
}

.tab-intro {
  margin-bottom: 20px;
}

.tab-intro-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.tab-intro-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 18px;
}

.label-with-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.input-control {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-control:focus {
  border-color: #059669;
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15);
}

.input-control.is-valid {
  border-color: #10b981;
}

.input-control.is-invalid {
  border-color: #ef4444;
}

/* 실시간 검증 피드백 메시지 */
.validation-msg {
  font-size: 12px;
  margin-top: 6px;
  font-weight: 600;
}

.validation-msg.success {
  color: #059669;
}

.validation-msg.error {
  color: #ef4444;
}

/* 비밀번호 강도 스타일 */
.strength-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.strength-pill.weak { background: #fee2e2; color: #ef4444; }
.strength-pill.medium { background: #fef3c7; color: #d97706; }
.strength-pill.strong { background: #dcfce7; color: #15803d; }

.strength-bar-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.pw-rules-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.rule-chip {
  font-size: 11px;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 7px;
  border-radius: 4px;
}

.rule-chip.ok {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
  font-weight: 700;
}

.rule-chip.ok::before {
  content: '✓ ';
}

/* 액션 버튼 */
.action-btn {
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  margin-top: 8px;
  transition: all 0.15s ease;
}

.action-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.action-btn.login { background: #059669; color: #ffffff; }
.action-btn.login:hover { background: #047857; }

.action-btn.signup { background: #0f172a; color: #ffffff; }
.action-btn.signup:hover:not(:disabled) { background: #1e293b; }

.action-btn.find { background: #2563eb; color: #ffffff; }
.action-btn.find:hover { background: #1d4ed8; }

/* 결과 박스 공통 */
.result-box {
  margin-top: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.no-result {
  font-size: 13px;
  color: #ef4444;
  text-align: center;
  font-weight: 600;
}

.found-label {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
}

.found-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.found-user-info {
  font-size: 13px;
  color: #475569;
  margin-bottom: 4px;
}

.found-email-val {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  font-family: monospace;
  background: #f1f5f9;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.quick-login-btn {
  background: none;
  border: none;
  color: #059669;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.quick-login-btn:hover {
  text-decoration: underline;
}

/* 임시 비밀번호 박스 */
.temp-pw-box {
  margin-top: 20px;
  background: #ecfdf5;
  border: 1.5px dashed #10b981;
  border-radius: 12px;
  padding: 18px;
}

.temp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #065f46;
  margin-bottom: 12px;
}

.temp-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.temp-pw-code {
  flex: 1;
  font-family: monospace;
  font-size: 16px;
  font-weight: 800;
  background: #ffffff;
  color: #047857;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
  letter-spacing: 1px;
}

.copy-pw-btn {
  padding: 8px 14px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.temp-notice {
  font-size: 11px;
  color: #047857;
  margin-bottom: 12px;
}

.auto-login-btn {
  width: 100%;
  padding: 10px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* 하단 링크 */
.bottom-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  font-size: 13px;
  color: #64748b;
}

.text-link {
  background: none;
  border: none;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
}

.text-link:hover {
  color: #059669;
  text-decoration: underline;
}

.text-link.highlight {
  color: #059669;
  font-weight: 700;
}

.sep {
  font-size: 11px;
  color: #cbd5e1;
}

.home-back-row {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.back-home-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
}

.back-home-btn:hover {
  color: #334155;
  text-decoration: underline;
}

@media (max-width: 500px) {
  .auth-page-container {
    padding: 16px 12px 60px;
  }
  .form-content {
    padding: 20px 16px;
  }
  .tab-btn {
    font-size: 11px;
    padding: 12px 2px;
  }
  .bottom-links {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
