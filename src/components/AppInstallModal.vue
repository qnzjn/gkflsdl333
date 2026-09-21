<template>
  <div v-if="isOpen" class="install-modal-overlay" @click.self="$emit('close')">
    <div class="install-sheet">
      <!-- 시트 드래그 핸들 (모바일 네이티브 바텀시트 느낌) -->
      <div class="sheet-drag-handle"></div>

      <!-- 상단 헤더 -->
      <div class="sheet-header">
        <div class="app-brand-badge">
          <LifeIcon :size="48" />
          <div class="badge-text">
            <h3 class="sheet-title">생활정보 공식 모바일 앱</h3>
            <span class="sheet-sub">Web App (PWA) · 빠른 속도 · 전체화면</span>
          </div>
        </div>
        <button class="sheet-close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- 주요 앱 혜택 안내 리스트 -->
      <div class="app-benefits">
        <div class="benefit-item">
          <span class="benefit-icon">⚡</span>
          <div>
            <strong>1초 즉시 실행 & 데이터 절약</strong>
            <p>브라우저 주소창 없이 실제 앱처럼 전체화면으로 빠르고 시원하게 읽을 수 있습니다.</p>
          </div>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🔔</span>
          <div>
            <strong>실시간 긴급 속보 & 생활정보</strong>
            <p>마트 휴무일, 응급실, 날씨, 생활 팁 등 매일 업데이트되는 10대 뉴스를 놓치지 마세요.</p>
          </div>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">💾</span>
          <div>
            <strong>스마트폰 용량 걱정 NO</strong>
            <p>수백 메가바이트의 일반 앱과 달리 1MB 이하의 초경량으로 기기 부담이 전혀 없습니다.</p>
          </div>
        </div>
      </div>

      <!-- 설치 분기: iOS인 경우 안내 가이드 -->
      <div v-if="isIOS" class="ios-guide-box">
        <div class="guide-title">
          <span>🍏</span> 아이폰 / 아이패드 (iOS Safari) 설치 방법
        </div>
        <ol class="ios-steps">
          <li>
            Safari 브라우저 하단 중앙의 <strong>[공유] 버튼</strong>(
            <svg class="ios-share-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            )을 탭하세요.
          </li>
          <li>나타난 메뉴 목록에서 <strong>[홈 화면에 추가]</strong>를 탭하세요.</li>
          <li>우측 상단의 <strong>[추가]</strong>를 누르면 홈 화면에 앱 아이콘이 바로 생성됩니다!</li>
        </ol>
      </div>

      <!-- 설치 분기: Android 및 기타 브라우저 원클릭 설치 버튼 -->
      <div v-else class="action-install-box">
        <button 
          v-if="!isInstalled" 
          class="btn-install-now" 
          @click="handleNativeInstall"
        >
          <span class="btn-icon">📲</span>
          지금 홈 화면에 앱 설치하기
        </button>
        <div v-else class="already-installed-msg">
          ✅ 현재 생활정보 앱으로 완벽하게 실행 중입니다!
        </div>
      </div>

      <!-- 닫기 버튼 -->
      <button class="sheet-cancel-btn" @click="$emit('close')">
        다음에 할게요
      </button>
    </div>
  </div>
</template>

<script setup>
import LifeIcon from './LifeIcon.vue'
import { usePwaInstall } from '../composables/usePwaInstall'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const { isInstalled, isIOS, deferredPrompt } = usePwaInstall()

async function handleNativeInstall() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      emit('close')
    }
    deferredPrompt.value = null
  } else {
    alert('브라우저 설정 메뉴(⋮)에서 [홈 화면에 추가] 또는 [앱 설치]를 선택해 주세요!')
  }
}
</script>

<style scoped>
.install-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.install-sheet {
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 24px 24px 0 0;
  padding: 16px 24px 32px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

@media (min-width: 769px) {
  .install-modal-overlay {
    align-items: center;
  }
  .install-sheet {
    border-radius: 20px;
    padding: 28px;
    animation: zoomIn 0.2s ease-out;
  }
}

.sheet-drag-handle {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 0 auto 16px;
}

@media (min-width: 769px) {
  .sheet-drag-handle {
    display: none;
  }
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.app-brand-badge {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sheet-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.sheet-sub {
  font-size: 12px;
  color: #059669;
  font-weight: 700;
  margin-top: 3px;
  display: block;
}

.sheet-close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  color: #64748b;
  cursor: pointer;
}

.app-benefits {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.benefit-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 20px;
  line-height: 1;
  background: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.benefit-item strong {
  font-size: 14px;
  color: #0f172a;
  display: block;
}

.benefit-item p {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.4;
}

/* iOS 가이드 박스 */
.ios-guide-box {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.guide-title {
  font-size: 14px;
  font-weight: 800;
  color: #065f46;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ios-steps {
  padding-left: 20px;
  font-size: 13px;
  color: #1e293b;
  line-height: 1.6;
}

.ios-steps li {
  margin-bottom: 6px;
}

.ios-share-icon {
  vertical-align: middle;
  display: inline-block;
  color: #0284c7;
}

/* 설치 버튼 */
.action-install-box {
  margin-bottom: 14px;
}

.btn-install-now {
  width: 100%;
  padding: 15px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
}

.btn-install-now:hover {
  background: #047857;
  transform: translateY(-2px);
}

.already-installed-msg {
  text-align: center;
  padding: 14px;
  background: #f0fdf4;
  color: #166534;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
}

.sheet-cancel-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.sheet-cancel-btn:hover {
  color: #475569;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
