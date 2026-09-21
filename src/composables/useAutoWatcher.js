import { ref } from 'vue'

export const currentVersion = ref('')
export const lastUpdatedAt = ref('')
export const isAutoUpdating = ref(false)
export const watcherStatus = ref('실시간 자동 감시 중 (3초 주기 폴링)')

let checkTimer = null
let initialVersion = null

// 서버의 version.json을 체크하여 사이트 변경 여부 자동 감시
async function checkServerVersion() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })

    if (!res.ok) return

    const data = await res.json()
    if (!data || !data.version) return

    currentVersion.value = data.version
    lastUpdatedAt.value = data.updatedAt

    // 첫 실행 시 초기 버전 기록
    if (!initialVersion) {
      initialVersion = data.version
      return
    }

    // 서버의 버전이 내가 보고 있는 초기 버전과 다르면 (즉 사이트가 수정/업데이트/배포되었으면)
    if (data.version !== initialVersion) {
      console.log(`[자동 감시기] 사이트 수정 감지됨: ${initialVersion} -> ${data.version}`)
      isAutoUpdating.value = true

      // 버튼 누를 필요 없이 1초 후 자동으로 최신 사이트로 자동 새로고침 갱신!
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  } catch (err) {
    // 네트워크 일시 오류 등은 조용히 무시
  }
}

// 3초마다 자동 폴링 감시 시작
export function startAutoWatcher() {
  if (checkTimer) return

  checkServerVersion()

  checkTimer = setInterval(() => {
    checkServerVersion()
  }, 3000)

  // 사용자가 다른 탭 갔다가 다시 돌아올 때도 즉시 감시
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkServerVersion()
    }
  })

  // 창 포커스 시에도 즉시 감시
  window.addEventListener('focus', () => {
    checkServerVersion()
  })
}

// 자동 감시 시작
startAutoWatcher()
