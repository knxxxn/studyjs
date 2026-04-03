import { ref, watch } from 'vue'

export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const today = new Date()
export const selectedDateStr = ref(formatDate(today))

const STORAGE_KEY = 'studyjs-todos'

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

const MEMO_STORAGE_KEY = 'studyjs-memos'

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

const GLOBAL_DDAY_KEY = 'studyjs-global-dday'

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
