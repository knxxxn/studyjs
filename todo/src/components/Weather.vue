<script setup>
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'studyjs-weather-box'

const defaultWeather = {
  city: 'Seoul',
  temperature: 22,
  condition: '맑음',
  note: '오후에는 가벼운 외투 챙기기',
  savedAt: '',
}

const savedWeather = loadWeather()

const city = ref(savedWeather.city)
const temperature = ref(savedWeather.temperature)
const condition = ref(savedWeather.condition)
const note = ref(savedWeather.note)
const savedAt = ref(savedWeather.savedAt)

const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))

function loadWeather() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return { ...defaultWeather }
  }

  try {
    return {
      ...defaultWeather,
      ...JSON.parse(saved),
    }
  } catch (error) {
    console.error('저장된 날씨 정보를 불러오지 못했습니다.', error)
    return { ...defaultWeather }
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

const currentMonthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  }),
)

const selectedDateLabel = computed(() =>
  selectedDate.value.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }),
)

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const startDate = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label: date.getDate(),
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDate(date, today),
      isSelected: isSameDate(date, selectedDate.value),
    }
  })
})

watch([city, temperature, condition, note], persistWeather)

function persistWeather() {
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

function saveWeather() {
  savedAt.value = new Date().toLocaleString('ko-KR')
  persistWeather()
}

function resetWeather() {
  city.value = defaultWeather.city
  temperature.value = defaultWeather.temperature
  condition.value = defaultWeather.condition
  note.value = ''
  savedAt.value = ''
  localStorage.removeItem(STORAGE_KEY)
}

function moveMonth(offset) {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + offset,
    1,
  )
}

function selectDate(date) {
  selectedDate.value = new Date(date)
}

function goToToday() {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDate.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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

    <section class="weather-card">
      <p class="city">{{ city }}</p>
      <p class="condition">{{ condition }}</p>
      <p class="temperature">{{ temperature }}°C</p>
    </section>

    <div class="field-group">
      <label for="city">도시명</label>
      <input id="city" v-model="city" type="text" placeholder="예: Busan" />
    </div>


    <section class="calendar-section">
      <div class="calendar-header">
        <div>
          <p class="calendar-title">Calendar</p>
          <p class="calendar-subtitle">{{ currentMonthLabel }}</p>
        </div>
        <div class="calendar-actions">
          <button type="button" class="calendar-control calendar-nav" @click="moveMonth(-1)">
            ‹
          </button>
          <button type="button" class="calendar-control calendar-today" @click="goToToday">
            오늘
          </button>
          <button type="button" class="calendar-control calendar-nav" @click="moveMonth(1)">
            ›
          </button>
        </div>
      </div>

      <div class="selected-date">선택한 날짜: {{ selectedDateLabel }}</div>

      <div class="calendar-weekdays">
        <span v-for="day in ['일', '월', '화', '수', '목', '금', '토']" :key="day">
          {{ day }}
        </span>
      </div>

      <div class="calendar-grid">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          class="calendar-control calendar-day"
          :class="{
            muted: !day.isCurrentMonth,
            today: day.isToday,
            selected: day.isSelected,
          }"
          @click="selectDate(day.date)"
        >
          {{ day.label }}
        </button>
      </div>
    </section>
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
  display: grid;
  gap: 14px;
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
  background: linear-gradient(135deg, #1d4ed8 55%, #0284c7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  text-transform: uppercase;
}

.weather-icon {
  font-size: 2.2rem;
}

.weather-card {
  margin-top: 6px;
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

.field-group {
  display: grid;
  gap: 8px;
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

.calendar-section {
  margin-top: 8px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.7), rgba(241, 245, 249, 0.95));
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.calendar-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.calendar-subtitle,
.selected-date {
  color: #475569;
}

.calendar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.calendar-control {
  border: none;
  border-radius: 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.calendar-nav,
.calendar-today {
  padding: 10px 12px;
  color: #0f172a;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.calendar-nav {
  min-width: 42px;
}

.selected-date {
  margin-top: 14px;
  font-size: 0.92rem;
  font-weight: 600;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.calendar-weekdays {
  margin-top: 16px;
  color: #64748b;
  font-size: 0.86rem;
  text-align: center;
}

.calendar-weekdays span {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 24px;
  font-weight: 700;
}

.calendar-grid {
  margin-top: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 0;
  border-radius: 18px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15);
}

.calendar-day.muted {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.55);
}

.calendar-day.today {
  box-shadow: inset 0 0 0 2px #38bdf8;
}

.calendar-day.selected {
  color: #eff6ff;
  background: linear-gradient(135deg, #0284c7, #2563eb);
}

@media (max-width: 640px) {
  .button-row {
    grid-template-columns: 1fr;
  }

  .calendar-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .calendar-actions {
    width: 100%;
  }

  .calendar-nav,
  .calendar-today {
    flex: 1;
  }
}
</style>
