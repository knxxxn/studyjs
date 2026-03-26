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
    // 이전 버전(배열)으로 저장되어 있다면 오늘 날짜 기준으로 마이그레이션
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
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
    // 빈 문자열인 경우 스토리지에 저장할 때 키를 제거하여 깔끔하게 유지합니다.
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
