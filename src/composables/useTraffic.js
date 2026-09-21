import { ref, onMounted, onUnmounted } from 'vue'

// 실시간 트래픽 데이터 상태
export const activeUsers = ref(12840) // 현재 동시 접속자 수
export const rps = ref(2450) // 초당 요청 수 (Requests Per Second)
export const latency = ref(16) // 평균 응답 속도 (ms)
export const cacheHitRate = ref(99.4) // 정적 캐시 적중률 (%)
export const isStressTesting = ref(false) // 대용량 트래픽 부하 테스트 모드

// 실시간 트래픽 기록 (그래프용 최근 20개 데이터 포인트)
export const trafficHistory = ref([
  8200, 8900, 9400, 10200, 11100, 11800, 12400, 12100, 12600, 12840
])

let intervalId = null

// 실시간 트래픽 요동 시뮬레이션
export function startTrafficSimulation() {
  if (intervalId) return

  intervalId = setInterval(() => {
    // 부하 테스트 중일 때는 트래픽이 30,000 ~ 60,000명으로 급증
    if (isStressTesting.value) {
      activeUsers.value = Math.floor(Math.random() * 15000 + 45000)
      rps.value = Math.floor(Math.random() * 3000 + 8500)
      latency.value = Math.floor(Math.random() * 8 + 24)
    } else {
      // 일반 평시: 11,000 ~ 15,000명 사이 자연스러운 변동
      const delta = Math.floor(Math.random() * 240) - 110
      activeUsers.value = Math.max(5000, activeUsers.value + delta)
      rps.value = Math.floor(activeUsers.value * 0.18 + (Math.random() * 100 - 50))
      latency.value = Math.floor(Math.random() * 4 + 14)
    }

    // 히스토리 업데이트
    trafficHistory.value.push(activeUsers.value)
    if (trafficHistory.value.length > 20) {
      trafficHistory.value.shift()
    }
  }, 1200)
}

// 대용량 트래픽 스트레스 부하 테스트 토글
export function toggleStressTest() {
  isStressTesting.value = !isStressTesting.value
  if (isStressTesting.value) {
    activeUsers.value = 52400
    rps.value = 9800
  }
}

// 초기 실행
startTrafficSimulation()
