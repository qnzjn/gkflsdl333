<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="auth-card">
      <!-- 모달 닫기 버튼 -->
      <button class="close-btn" @click="close">×</button>

      <!-- 탭: 로그인 / 회원가입 -->
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: mode === 'login' }]"
          @click="switchMode('login')"
        >
          로그인
        </button>
        <button 
          :class="['tab-btn', { active: mode === 'signup' }]"
          @click="switchMode('signup')"
        >
          회원가입
        </button>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- 1. 로그인 폼 -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="form-body">
        <div class="field">
          <label class="label">이메일 또는 아이디</label>
          <input 
            type="text" 
            v-model="loginForm.email" 
            placeholder="example@naver.com" 
            class="input" 
            required 
          />
        </div>

        <div class="field">
          <label class="label">비밀번호</label>
          <input 
            type="password" 
            v-model="loginForm.password" 
            placeholder="비밀번호 입력" 
            class="input" 
            required 
          />
        </div>

        <button type="submit" class="submit-btn">
          생활정보 로그인
        </button>

        <p class="switch-hint">
          아직 회원이 아니신가요? 
          <a href="#" @click.prevent="switchMode('signup')">회원가입하기</a>
        </p>
      </form>

      <!-- 2. 회원가입 폼 -->
      <form v-else @submit.prevent="handleSignup" class="form-body">
        <div class="field">
          <label class="label">이름 (닉네임)</label>
          <input 
            type="text" 
            v-model="signupForm.name" 
            placeholder="홍길동" 
            class="input" 
            required 
          />
        </div>

        <div class="field">
          <label class="label">이메일 (아이디로 사용)</label>
          <input 
            type="email" 
            v-model="signupForm.email" 
            placeholder="example@naver.com" 
            class="input" 
            required 
          />
        </div>

        <div class="field">
          <label class="label">비밀번호</label>
          <input 
            type="password" 
            v-model="signupForm.password" 
            placeholder="비밀번호 (6자 이상)" 
            class="input" 
            minlength="4"
            required 
          />
        </div>

        <button type="submit" class="submit-btn signup">
          1초 만에 회원가입 완료
        </button>

        <p class="switch-hint">
          이미 계정이 있으신가요? 
          <a href="#" @click.prevent="switchMode('login')">로그인하기</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { registerUser, loginUser } from '../composables/useAuth'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'success'])

const mode = ref('signup') // 기본적으로 회원가입을 먼저 보여줌
const errorMessage = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const signupForm = reactive({
  name: '',
  email: '',
  password: ''
})

function switchMode(newMode) {
  mode.value = newMode
  errorMessage.value = ''
}

function close() {
  errorMessage.value = ''
  emit('close')
}

function handleLogin() {
  try {
    errorMessage.value = ''
    loginUser(loginForm.email, loginForm.password)
    emit('success')
    close()
  } catch (err) {
    errorMessage.value = err.message
  }
}

function handleSignup() {
  try {
    errorMessage.value = ''
    registerUser(signupForm.name, signupForm.email, signupForm.password)
    alert(`🎉 ${signupForm.name}님, 회원가입이 완료되었습니다!`)
    emit('success')
    close()
  } catch (err) {
    errorMessage.value = err.message
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.auth-card {
  background: #ffffff;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #0f172a;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-btn {
  flex: 1;
  padding: 16px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-btn.active {
  color: #059669;
  border-bottom-color: #059669;
  background: #ffffff;
  font-weight: 700;
}

.error-banner {
  background: #fef2f2;
  color: #ef4444;
  font-size: 13px;
  padding: 10px 16px;
  border-bottom: 1px solid #fee2e2;
  text-align: center;
}

.form-body {
  padding: 24px;
}

.field {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15);
}

.submit-btn {
  width: 100%;
  padding: 13px;
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.15s ease;
}

.submit-btn:hover {
  background: #047857;
}

.submit-btn.signup {
  background: #0f172a;
}

.submit-btn.signup:hover {
  background: #1e293b;
}

.switch-hint {
  font-size: 13px;
  color: #64748b;
  text-align: center;
  margin-top: 16px;
}

.switch-hint a {
  color: #059669;
  font-weight: 600;
  text-decoration: none;
}

.switch-hint a:hover {
  text-decoration: underline;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>
