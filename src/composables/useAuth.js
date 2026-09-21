import { ref, watch } from 'vue'

const STORAGE_KEY = 'life_news_users'
const CURRENT_USER_KEY = 'life_news_current_user'

// 기본 회원 데이터
const defaultUsers = [
  {
    id: 1,
    name: '김민준',
    email: 'minjun@naver.com',
    role: '일반회원',
    status: '활동중 (온라인)',
    createdAt: '2026.09.18 14:22',
    lastLoginAt: '2026.09.21 21:30'
  },
  {
    id: 2,
    name: '이지은',
    email: 'jieun@kakao.com',
    role: '일반회원',
    status: '활동중 (온라인)',
    createdAt: '2026.09.19 11:05',
    lastLoginAt: '2026.09.21 21:40'
  },
  {
    id: 3,
    name: '박서준',
    email: 'seojun@gmail.com',
    role: '일반회원',
    status: '활동중',
    createdAt: '2026.09.20 09:30',
    lastLoginAt: '2026.09.21 20:10'
  }
]

// 실시간 활성 접속자 세션 목록 (온라인 회원 리스트)
export const onlineSessions = ref([
  {
    id: 101,
    name: '김민준',
    email: 'minjun@naver.com',
    device: 'Windows PC (Chrome)',
    location: '서울 강남구',
    connectedAt: '21:30 (15분 전)',
    currentPage: '최신뉴스 (메인)'
  },
  {
    id: 102,
    name: '이지은',
    email: 'jieun@kakao.com',
    device: 'iPhone 15 (Safari)',
    location: '경기 성남시 분당구',
    connectedAt: '21:40 (5분 전)',
    currentPage: '건강 (비상병원 안내)'
  }
])

// 로컬 스토리지에서 회원 목록 불러오기
function loadUsers() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try { return JSON.parse(saved) } catch (e) {}
  }
  return defaultUsers
}

function loadCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY)
  if (saved) {
    try { return JSON.parse(saved) } catch (e) {}
  }
  return null
}

export const users = ref(loadUsers())
export const currentUser = ref(loadCurrentUser())

// 만약 이미 로그인된 사용자가 있다면 실시간 접속 세션에 등록
if (currentUser.value) {
  addOnlineSession(currentUser.value)
}

function addOnlineSession(user) {
  const exists = onlineSessions.value.find(s => s.email === user.email)
  if (!exists) {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} (방금 접속)`
    onlineSessions.value.unshift({
      id: user.id || Date.now(),
      name: user.name,
      email: user.email,
      device: navigator.userAgent.includes('Mobile') ? '모바일 기기' : 'Windows PC (브라우저)',
      location: '서울 특별시',
      connectedAt: timeStr,
      currentPage: '실시간 생활정보 홈'
    })
  }
}

function removeOnlineSession(email) {
  onlineSessions.value = onlineSessions.value.filter(s => s.email !== email)
}

watch(users, (newUsers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers))
}, { deep: true })

watch(currentUser, (newUser) => {
  if (newUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    addOnlineSession(newUser)
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}, { deep: true })

// 회원가입 함수
export function registerUser(name, email, password) {
  const existing = users.value.find(u => u.email === email)
  if (existing) {
    throw new Error('이미 사용 중인 이메일/아이디입니다.')
  }

  const now = new Date()
  const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: '일반회원',
    status: '활동중 (온라인)',
    createdAt: formattedDate,
    lastLoginAt: formattedDate
  }

  users.value.unshift(newUser)
  currentUser.value = newUser
  addOnlineSession(newUser)
  return newUser
}

// 로그인 함수
export function loginUser(email, password) {
  const user = users.value.find(u => u.email === email)
  if (!user) {
    throw new Error('등록되지 않은 이메일/아이디입니다.')
  }

  if (user.password && user.password !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.')
  }

  const now = new Date()
  const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  user.lastLoginAt = formattedDate
  user.status = '활동중 (온라인)'

  currentUser.value = user
  addOnlineSession(user)
  return user
}

// 로그아웃 함수
export function logoutUser() {
  if (currentUser.value) {
    const user = users.value.find(u => u.id === currentUser.value.id)
    if (user) {
      user.status = '오프라인'
    }
    removeOnlineSession(currentUser.value.email)
  }
  currentUser.value = null
}

// 회원 강제 삭제 (관리자용)
export function removeUser(id) {
  const target = users.value.find(u => u.id === id)
  if (target) {
    removeOnlineSession(target.email)
  }
  users.value = users.value.filter(u => u.id !== id)
  if (currentUser.value && currentUser.value.id === id) {
    currentUser.value = null
  }
}

// 회원 정보 수정 (프로필)
export function updateUserProfile(id, { name, password }) {
  const user = users.value.find(u => u.id === id)
  if (!user) throw new Error('회원 정보를 찾을 수 없습니다.')

  if (name) {
    user.name = name
    const session = onlineSessions.value.find(s => s.email === user.email)
    if (session) session.name = name
  }
  if (password) {
    user.password = password
  }
  if (currentUser.value && currentUser.value.id === id) {
    currentUser.value = { ...user }
  }
}

// 회원 탈퇴 (영구 계정 삭제)
export function withdrawAccount(id) {
  removeUser(id)
}

// 닉네임 중복 검사 (버튼 없이 실시간 체크용)
export function isNameTaken(name, currentUserId = null) {
  if (!name || !name.trim()) return false
  const target = name.trim().toLowerCase()
  return users.value.some(u => u.name.trim().toLowerCase() === target && u.id !== currentUserId)
}

// 이메일 중복 검사 (버튼 없이 실시간 체크용)
export function isEmailTaken(email, currentUserId = null) {
  if (!email || !email.trim()) return false
  const target = email.trim().toLowerCase()
  return users.value.some(u => u.email.trim().toLowerCase() === target && u.id !== currentUserId)
}

// 이메일(아이디) 찾기: 닉네임 입력 시 등록된 이메일 전체 반환
export function findEmailByName(name) {
  if (!name || !name.trim()) return []
  const target = name.trim().toLowerCase()
  return users.value.filter(u => u.name.trim().toLowerCase() === target)
}

// 비밀번호 찾기: 이메일 확인 후 강력한 임시 비밀번호 자동 생성 및 발급
export function generateTempPassword(email) {
  if (!email || !email.trim()) {
    throw new Error('이메일을 입력해 주세요.')
  }
  const target = email.trim().toLowerCase()
  const user = users.value.find(u => u.email.trim().toLowerCase() === target)
  if (!user) {
    throw new Error('등록되지 않은 이메일 주소입니다.')
  }

  // 강력한 10자리 임시 비밀번호 생성 (영문 대소문자 + 숫자 + 특수문자 조합)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const smalls = 'abcdefghijkmnpqrstuvwxyz'
  const numbers = '23456789'
  const specials = '!@#$%^&*'
  
  let tempPw = ''
  tempPw += letters.charAt(Math.floor(Math.random() * letters.length))
  tempPw += smalls.charAt(Math.floor(Math.random() * smalls.length))
  tempPw += numbers.charAt(Math.floor(Math.random() * numbers.length))
  tempPw += specials.charAt(Math.floor(Math.random() * specials.length))
  
  const allChars = letters + smalls + numbers + specials
  for (let i = 0; i < 6; i++) {
    tempPw += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // 회원 비밀번호를 임시 비밀번호로 교체
  user.password = tempPw
  
  return {
    user,
    tempPassword: tempPw
  }
}
