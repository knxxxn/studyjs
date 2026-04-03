import { ref, watch } from 'vue'

export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const today = new Date()
export const selectedDateStr = ref(formatDate(today))

// ── 스토리지 키 상수 (cleanOldData보다 먼저 선언) ──
const STORAGE_KEY = 'studyjs-todos'
const MEMO_STORAGE_KEY = 'studyjs-memos'
const GLOBAL_DDAY_KEY = 'studyjs-global-dday'

// ── 오래된 데이터 자동 정리 ──
// - 투두/메모: 180일 이상 지난 날짜 키 삭제
// - 글로벌 디데이: 목표일이 180일 이상 지난 경우(D+180~) 자동 삭제, 미래(D-) 또는 최근은 유지
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
    } catch (e) {
      // 파싱 실패 시 그냥 넘어감
    }
  }

  // 글로벌 디데이 정리: 목표일이 180일 이상 지난 경우만 삭제 (미래 목표는 유지)
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
function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return {}
  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) {
      return { [formatDate(today)]: parsed }
    }
    return parsed
  } catch (error) {
    console.error('Failed to load todos from local storage.', error)
    return {}
  }
}

export const todosByDate = ref(loadTodos())

watch(
  todosByDate,
  (newValue) => {
    const dataToSave = {}
    for (const date in newValue) {
      if (Array.isArray(newValue[date]) && newValue[date].length > 0) {
        dataToSave[date] = newValue[date]
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  },
  { deep: true },
)

// ── 메모 ──
function loadMemos() {
  const saved = localStorage.getItem(MEMO_STORAGE_KEY)
  if (!saved) return {}
  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error('Failed to load memos from local storage.', error)
    return {}
  }
}

export const memosByDate = ref(loadMemos())

watch(
  memosByDate,
  (newValue) => {
    const dataToSave = {}
    for (const date in newValue) {
      if (newValue[date] && newValue[date].trim() !== '') {
        dataToSave[date] = newValue[date]
      }
    }
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(dataToSave))
  },
  { deep: true },
)

// ── 글로벌 디데이 ──
function loadGlobalDDay() {
  const saved = localStorage.getItem(GLOBAL_DDAY_KEY)
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error('Failed to load global D-Day from local storage.', error)
    return null
  }
}

export const globalDDay = ref(loadGlobalDDay())

watch(
  globalDDay,
  (newValue) => {
    if (newValue) {
      localStorage.setItem(GLOBAL_DDAY_KEY, JSON.stringify(newValue))
    } else {
      localStorage.removeItem(GLOBAL_DDAY_KEY)
    }
  },
  { deep: true },
)

export function getDDayText(targetDateStr) {
  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [ty, tm, td] = targetDateStr.split('-').map(Number)
  const target = new Date(ty, tm - 1, td)

  const diffTime = target - current
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) return `D-${diffDays}`
  if (diffDays === 0) return `D-Day`
  return `D+${Math.abs(diffDays)}`
}
