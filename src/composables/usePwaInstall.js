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
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true
  })

  // 설치 완료 시 이벤트
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    isInstallable.value = false
    deferredPrompt.value = null
  })
}

// 버튼 누르면 복잡한 창 없이 즉시 원클릭 네이티브 앱 설치 프롬프트 실행
export async function triggerInstallApp() {
  if (isInstalled.value) {
    alert('✅ 이미 생활정보 앱으로 실행 중입니다!')
    return
  }

  if (deferredPrompt.value) {
    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        isInstalled.value = true
      }
      deferredPrompt.value = null
    } catch (err) {
      alert('브라우저 메뉴(⋮)에서 [홈 화면에 추가] 또는 [앱 설치]를 선택해 주세요.')
    }
  } else if (isIOS.value) {
    alert('📱 아이폰 사파리(Safari) 하단의 [공유] 아이콘을 누른 후 [홈 화면에 추가]를 선택하시면 즉시 앱으로 설치됩니다!')
  } else {
    alert('📱 브라우저 메뉴(⋮)에서 [홈 화면에 추가] 또는 [앱 설치]를 누르시면 스마트폰에 바로 설치됩니다!')
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
