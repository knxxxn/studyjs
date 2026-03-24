<script setup>
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'studyjs-weather-box'

const savedWeather = loadWeather()

const city = ref(savedWeather.city)
const temperature = ref(savedWeather.temperature)
const condition = ref(savedWeather.condition)
const note = ref(savedWeather.note)
const savedAt = ref(savedWeather.savedAt)

function loadWeather() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {
      city: 'Seoul',
      temperature: 22,
      condition: '맑음',
      note: '오후에는 가벼운 외투 챙기기',
      savedAt: '',
    }
  }

  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error('저장된 날씨 정보를 불러오지 못했습니다.', error)
    return {
      city: 'Seoul',
      temperature: 22,
      condition: '맑음',
      note: '',
      savedAt: '',
    }
  }
}

const weatherEmoji = computed(() => {
  const iconMap = {
    맑음: '☀️',
    흐림: '☁️',
    비: '🌧️',
    눈: '❄️',
  }

  return iconMap[condition.value] ?? '🌤️'
})

watch([city, temperature, condition, note], () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      city: city.value,
      temperature: temperature.value,
      condition: condition.value,
      note: note.value,
      savedAt: savedAt.value,
    }),
  )
})

function saveWeather() {
  savedAt.value = new Date().toLocaleString()
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      city: city.value,
      temperature: temperature.value,
      condition: condition.value,
      note: note.value,
      savedAt: savedAt.value,
    }),
  )
}

function resetWeather() {
  city.value = 'Seoul'
  temperature.value = 22
  condition.value = '맑음'
  note.value = ''
  savedAt.value = ''
  localStorage.removeItem(STORAGE_KEY)
}
</script>

<template>
  <article class="panel weather-panel">
    <div class="panel-header">
      <div>
        <h2 class="gradient-text">Weather</h2>
      </div>
      <div class="weather-icon">{{ weatherEmoji }}</div>
    </div>


    <div class="field-group">
      <label for="city">도시명</label>
      <input id="city" v-model="city" type="text" placeholder="예: Busan" />
    </div> 

  </article>
</template>

<style scoped>
.panel {
  height: 100%;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.weather-panel {
  background:
    radial-gradient(circle at top right, rgba(125, 211, 252, 0.28), transparent 28%),
    rgba(255, 255, 255, 0.92);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.gradient-text {
  font-size: 2rem;
  font-weight: bold;
  /* 1. 그라데이션 배경 정의 */
  background:  linear-gradient(135deg, #1d4ed8 55%, #0284c7);
  
  /* 2. 배경을 글씨 모양으로 자름 */
  -webkit-background-clip: text;
  background-clip: text;
  
  /* 3. 실제 글자 색을 투명하게 설정 */
  -webkit-text-fill-color: transparent;
  
  /* 배경이 글자 밖으로 나오지 않게 처리 */
  display: inline-block;

  /* 텍스트를 대문자로 변환 */
  text-transform: uppercase;
}


.weather-icon {
  font-size: 2.2rem;
}

.weather-card {
  margin: 20px 0;
  padding: 22px;
  border-radius: 22px;
  color: #eff6ff;
  background: linear-gradient(135deg, #0f172a, #0369a1);
}

.city {
  font-size: 1.4rem;
  font-weight: 800;
}

.condition {
  margin-top: 4px;
  color: rgba(239, 246, 255, 0.8);
}

.temperature {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
}

.note-preview,
.saved-at {
  margin-top: 8px;
  color: rgba(239, 246, 255, 0.84);
}

.field-group {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
}

input,
select,
textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font: inherit;
  color: #0f172a;
  background: #fff;
}

input:focus,
select:focus,
textarea:focus {
  outline: 3px solid rgba(14, 165, 233, 0.18);
  border-color: #38bdf8;
}

.button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
}

button {
  padding: 14px 18px;
  border: none;
  border-radius: 14px;
  font: inherit;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #0284c7, #22c55e);
  cursor: pointer;
}

.secondary {
  color: #0f172a;
  background: #e2e8f0;
}
</style>
