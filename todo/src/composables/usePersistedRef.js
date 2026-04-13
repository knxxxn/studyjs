import { ref, watch } from 'vue'

/**
 * 로컬 스토리지와 동기화되는 ref를 생성하는 Composable
 * @param {string} key 로컬 스토리지에 저장될 키
 * @param {any} initialValue 초기값
 * @param {Function} autoCleaner 정리 함수(선택)
 */
export function usePersistedRef(key, initialValue, customValidator = null) {
  // 1. 초기 로드
  const saved = localStorage.getItem(key)
  let loadedValue = initialValue
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (customValidator && !customValidator(parsed)) {
        console.warn(`[usePersistedRef] Validator failed for key: ${key}`)
      } else {
        loadedValue = parsed
      }
    } catch (error) {
      console.error(`[usePersistedRef] Failed to parse local storage for key ${key}`, error)
    }
  }

  const state = ref(loadedValue)

  // 2. 값 변경 시 자동 저장
  watch(
    state,
    (newValue) => {
      // 값이 null이나 undefined면 삭제
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(key)
        return
      }
      
      // 혹시 값이 빈 객체이거나 비어있어야 할 땐, 커스텀 로직(예: 빈 배열 제외)은 
      // 앱 단(watch 밖)에서 데이터를 정리(clean) 후 저장하는 식으로 하거나
      // 여기서 재귀적으로 얕은 정리를 할 수도 있습니다.
      // (이 프로젝트에서는 범용적으로 stringify를 사용합니다.)
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return state
}
