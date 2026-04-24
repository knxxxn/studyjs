import { ref, watch } from 'vue'
import { formatDate } from './utils/dateUtils.js'
import { usePersistedRef } from './composables/usePersistedRef.js'

// 기존 익스포트들이 날짜 유틸 등을 사용하던 컴포넌트를 위해 다시 익스포트 해줍니다.
export { formatDate, getDDayText } from './utils/dateUtils.js'

export function getTodayStr() {
  return formatDate(new Date())
}

export const selectedDateStr = ref(getTodayStr())

// ── 인증 및 유저 정보 ──
export const userToken = ref(localStorage.getItem('studyjs-token') || null)
export const userName = ref(localStorage.getItem('studyjs-username') || '')

watch(userToken, (val) => {
  if (val) localStorage.setItem('studyjs-token', val)
  else localStorage.removeItem('studyjs-token')
})
watch(userName, (val) => {
  if (val) localStorage.setItem('studyjs-username', val)
  else localStorage.removeItem('studyjs-username')
})

const STORAGE_KEY = 'studyjs-todos'
const MEMO_STORAGE_KEY = 'studyjs-memos'
const GLOBAL_DDAY_KEY = 'studyjs-global-dday'

const CLEANUP_THRESHOLD_DAYS = 180

function cleanOldData() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - CLEANUP_THRESHOLD_DAYS)
  const cutoffStr = formatDate(cutoff)

  // 투두 & 메모 정리
  for (const key of [STORAGE_KEY, MEMO_STORAGE_KEY]) {
    const saved = localStorage.getItem(key)
    if (!saved) continue
    try {
      const parsed = JSON.parse(saved)
      if (typeof parsed !== 'object' || Array.isArray(parsed)) continue

      let changed = false
      for (const date in parsed) {
        if (date < cutoffStr) {
          delete parsed[date]
          changed = true
        }
      }
      if (changed) {
        localStorage.setItem(key, JSON.stringify(parsed))
      }
    } catch (e) { }
  }

  // 글로벌 디데이 정리
  const savedDDay = localStorage.getItem(GLOBAL_DDAY_KEY)
  if (savedDDay) {
    try {
      const parsed = JSON.parse(savedDDay)
      if (parsed?.date && parsed.date < cutoffStr) {
        localStorage.removeItem(GLOBAL_DDAY_KEY)
      }
    } catch (e) {}
  }
}

cleanOldData()

// ── 투두 ──
// 예전에 배열 형태로 저장되었을 가능성에 대비한 마이그레이션 적용
let initialTodos = {}
const savedTodos = localStorage.getItem(STORAGE_KEY)
if (savedTodos) {
  try {
    const parsed = JSON.parse(savedTodos)
    if (Array.isArray(parsed)) {
      initialTodos = { [formatDate(new Date())]: parsed }
    } else {
      initialTodos = parsed
    }
  } catch(e) {}
}

export const todosByDate = ref(initialTodos)

watch(
  todosByDate,
  async (newValue) => {
    const dataToSave = {}
    for (const date in newValue) {
      if (Array.isArray(newValue[date]) && newValue[date].length > 0) {
        dataToSave[date] = newValue[date]
      }
    }
    // 로컬 스토리지에 무조건 백업
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))

    // 로그인 상태이고 서버 동기화 중이 아니라면 백엔드 API로 전송
    if (userToken.value && !isSyncing) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      try {
        await fetch(`${baseUrl}/api/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken.value}`
          },
          body: JSON.stringify(dataToSave)
        })
      } catch (err) {
        console.error('백엔드 투두 저장 실패:', err)
      }
    }
  },
  { deep: true },
)

// ── 메모 ──
export const memosByDate = ref({})
const savedMemos = localStorage.getItem(MEMO_STORAGE_KEY)
if (savedMemos) {
  try { memosByDate.value = JSON.parse(savedMemos) } catch(e) {}
}

watch(
  memosByDate,
  async (newValue) => {
    const dataToSave = {}
    for (const date in newValue) {
      if (newValue[date] && newValue[date].trim() !== '') {
        dataToSave[date] = newValue[date]
      }
    }
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(dataToSave))

    if (userToken.value && !isSyncing) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      try {
        await fetch(`${baseUrl}/api/memos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken.value}`
          },
          body: JSON.stringify(dataToSave)
        })
      } catch (err) {
        console.error('백엔드 메모 저장 실패:', err)
      }
    }
  },
  { deep: true },
)

// ── 글로벌 디데이 ──
export const globalDDay = usePersistedRef(GLOBAL_DDAY_KEY, null)

// ── 서버 동기화 ──
let isSyncing = false  // 서버에서 데이터를 불러오는 중에는 watch가 다시 서버로 보내지 않도록 방지

export async function fetchFromServer() {
  if (!userToken.value) return
  
  isSyncing = true
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  
  try {
    // 투두 불러오기
    const todosRes = await fetch(`${baseUrl}/api/todos`, {
      headers: { 'Authorization': `Bearer ${userToken.value}` }
    })
    if (todosRes.ok) {
      const serverTodos = await todosRes.json()
      // 서버 데이터와 로컬 데이터 병합 (서버 데이터 우선)
      const merged = { ...todosByDate.value }
      for (const date in serverTodos) {
        merged[date] = serverTodos[date]
      }
      todosByDate.value = merged
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    }
    
    // 메모 불러오기
    const memosRes = await fetch(`${baseUrl}/api/memos`, {
      headers: { 'Authorization': `Bearer ${userToken.value}` }
    })
    if (memosRes.ok) {
      const serverMemos = await memosRes.json()
      const merged = { ...memosByDate.value }
      for (const date in serverMemos) {
        merged[date] = serverMemos[date]
      }
      memosByDate.value = merged
      localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(merged))
    }
  } catch (err) {
    console.error('서버 데이터 불러오기 실패:', err)
  } finally {
    // 약간의 딜레이를 주어 watch가 다 실행된 후 플래그를 해제
    setTimeout(() => { isSyncing = false }, 500)
  }
}

// isSyncing 플래그를 외부에서 확인할 수 있도록 export
export function getIsSyncing() { return isSyncing }
