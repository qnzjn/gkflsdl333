<template>
  <div v-if="isAutoUpdating" class="auto-reload-banner">
    <div class="banner-content">
      <div class="spinner"></div>
      <div class="banner-text">
        <strong>사이트 업데이트 감지됨!</strong>
        <span>최신 수정 사항을 반영하여 자동으로 화면을 갱신 중입니다...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isAutoUpdating } from '../composables/useAutoWatcher'
</script>

<style scoped>
.auto-reload-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  color: #ffffff;
  padding: 14px 24px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  animation: slideDown 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #34d399;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.banner-text {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.banner-text strong {
  font-size: 14px;
  color: #34d399;
}

.banner-text span {
  font-size: 12px;
  color: #94a3b8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
