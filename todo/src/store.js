import { ref, watch } from 'vue'
import { formatDate } from './utils/dateUtils.js'
import { usePersistedRef } from './composables/usePersistedRef.js'

// 기존 익스포트들이 날짜 유틸 등을 사용하던 컴포넌트를 위해 다시 익스포트 해줍니다.
export { formatDate, getDDayText } from './utils/dateUtils.js'

export function getTodayStr() {
  return formatDate(new Date())
}

export const selectedDateStr = ref(getTodayStr())

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
export const memosByDate = ref({})
const savedMemos = localStorage.getItem(MEMO_STORAGE_KEY)
if (savedMemos) {
  try { memosByDate.value = JSON.parse(savedMemos) } catch(e) {}
}

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
export const globalDDay = usePersistedRef(GLOBAL_DDAY_KEY, null)
