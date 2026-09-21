import { createApp } from 'vue'
import App from './App.vue'
import { initPwa } from './composables/usePwaInstall'

// PWA 감지 및 이벤트 리스너 초기화
initPwa()

// PWA 서비스 워커(Service Worker) 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('생활정보 PWA ServiceWorker 등록 완료:', reg.scope)
      })
      .catch((err) => {
        console.warn('생활정보 PWA ServiceWorker 등록 실패:', err)
      })
  })
}

createApp(App).mount('#app')
