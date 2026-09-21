<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3 class="modal-title">관리자 보안 인증</h3>
        <p class="modal-desc">관리자 페이지 접근을 위해 강력한 비밀번호를 입력하세요.</p>
      </div>

      <form @submit.prevent="handleLogin" class="modal-body">
        <div class="input-group">
          <label class="input-label">관리자 마스터 비밀번호</label>
          <div class="password-wrapper">
            <input 
              ref="passwordInput"
              :type="showPassword ? 'text' : 'password'" 
              v-model="inputPassword" 
              placeholder="비밀번호를 입력하세요" 
              class="password-input"
              :class="{ 'has-error': errorMsg }"
              autocomplete="current-password"
            />
            <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '숨김' : '보기' }}
            </button>
          </div>
          <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        </div>

        <div class="key-hint-box">
          <div class="hint-label">🔑 기본 설정된 강력한 마스터 비밀번호</div>
          <div class="hint-code-row">
            <code class="hint-code">{{ masterPassword }}</code>
            <button type="button" class="copy-btn" @click="copyPassword">
              {{ copied ? '복사됨!' : '비번 자동입력' }}
            </button>
          </div>
          <div class="hint-info">영문 대소문자 + 특수문자 + 숫자 조합의 14자리 보안 비밀번호</div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="close">취소</button>
          <button type="submit" class="btn-submit">관리자 페이지 입장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  masterPassword: {
    type: String,
    default: 'Life2026!@#Admin'
  }
})

const emit = defineEmits(['close', 'success'])

const inputPassword = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const copied = ref(false)
const passwordInput = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    inputPassword.value = ''
    errorMsg.value = ''
    copied.value = false
    nextTick(() => {
      passwordInput.value?.focus()
    })
  }
})

function close() {
  emit('close')
}

function copyPassword() {
  inputPassword.value = props.masterPassword
  copied.value = true
  errorMsg.value = ''
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handleLogin() {
  if (!inputPassword.value) {
    errorMsg.value = '비밀번호를 입력해 주세요.'
    return
  }

  if (inputPassword.value === props.masterPassword) {
    emit('success')
  } else {
    errorMsg.value = '비밀번호가 올바르지 않습니다. 다시 시도해 주세요.'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.modal-header {
  padding: 24px 24px 16px;
  text-align: center;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.modal-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
}

.modal-body {
  padding: 0 24px 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding: 12px 64px 12px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.15s ease;
}

.password-input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.password-input.has-error {
  border-color: #ef4444;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
}

.toggle-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

.key-hint-box {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
}

.hint-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

.hint-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.hint-code {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.copy-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #047857;
}

.hint-info {
  font-size: 11px;
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  gap: 10px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  flex: 2;
  padding: 12px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-submit:hover {
  background: #047857;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>
