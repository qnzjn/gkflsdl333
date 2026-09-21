import { ref } from 'vue'

const deferredPrompt = ref(null)
const isInstallable = ref(false)
const isInstalled = ref(false)
const isIOS = ref(false)
const showInstallModal = ref(false)

// 브라우저 환경 감지 및 초기화
export function initPwa() {
  if (typeof window === 'undefined') return

  // 1. 이미 PWA 앱(스탠드얼론)으로 실행 중인지 확인
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://')
  
  isInstalled.value = isStandalone

  // 2. iOS Safari 환경 감지
  const userAgent = window.navigator.userAgent.toLowerCase()
  isIOS.value = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream

  // 3. Android/Chrome/Edge PWA 설치 준비 이벤트 리스너 등록
  window.addEventListener('beforeinstallprompt', (e) => {
    // 기본 브라우저 배너 방지
    e.preventDefault()
    // 프롬프트 이벤트 저장
    deferredPrompt.value = e
    isInstallable.value = true
  })

  // 설치 완료 시 이벤트
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    isInstallable.value = false
    deferredPrompt.value = null
    console.log('생활정보 앱이 성공적으로 설치되었습니다!')
  })
}

// 앱 설치 함수 실행
export async function triggerInstallApp() {
  // 이미 설치되어 스탠드얼론 모드인 경우
  if (isInstalled.value) {
    alert('✅ 이미 생활정보 앱으로 실행 중입니다!')
    return
  }

  // iOS인 경우 가이드 모달 표시
  if (isIOS.value) {
    showInstallModal.value = true
    return
  }

  // Android / Chrome / Edge에서 네이티브 설치 프롬프트가 준비된 경우
  if (deferredPrompt.value) {
    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        isInstalled.value = true
      }
      deferredPrompt.value = null
    } catch (err) {
      console.warn('PWA prompt error:', err)
      showInstallModal.value = true
    }
  } else {
    // 프롬프트가 바로 지원되지 않는 브라우저나 데스크톱에서는 안내 모달 표시
    showInstallModal.value = true
  }
}

export function usePwaInstall() {
  return {
    deferredPrompt,
    isInstallable,
    isInstalled,
    isIOS,
    showInstallModal,
    triggerInstallApp
  }
}
