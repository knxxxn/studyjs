<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { selectedDateStr, todosByDate, globalDDay, formatDate, getDDayText } from '../store.js'
import { isSameDate } from '../utils/dateUtils.js'
import { REGIONS } from '../constants/regions.js'
import { usePersistedRef } from '../composables/usePersistedRef.js'
import { useWeather, getWeatherEmoji } from '../composables/useWeather.js'

const showDDayModal = ref(false)
const showRegionModal = ref(false)
const ddayInput = ref({ title: '', date: selectedDateStr.value })

watch(showDDayModal, (val) => {
  if (val) {
    if (globalDDay.value) {
      ddayInput.value = { ...globalDDay.value }
    } else {
      ddayInput.value = { title: '', date: selectedDateStr.value }
    }
  }
})

function saveDDay() {
  if (!ddayInput.value.title || !ddayInput.value.date) {
    alert('이름과 날짜를 입력해주세요.')
    return
  }
  globalDDay.value = { ...ddayInput.value }
  showDDayModal.value = false
}

function clearDDay() {
  globalDDay.value = null
  showDDayModal.value = false
}

const selectedRegion = usePersistedRef('studyjs-weather-region', REGIONS[0])

function pickRegion(r) {
  selectedRegion.value = r
  showRegionModal.value = false
}

const { weatherData, forecastList, weatherError, fetchWeather } = useWeather(selectedRegion)



const timeOfDayClass = computed(() => {
  const hour = new Date().getHours()
  // 오전 6시 ~ 오후 6시엔 낮 테마(밝은색), 그 외는 밤 테마(어두운색) 적용
  return (hour >= 6 && hour < 18) ? 'theme-day' : 'theme-night'
})

const weatherEffectClass = computed(() => {
  const c = weatherData.value.condition
  if (c === '비' || c === '소나기' || c === '비/눈') return 'effect-rain'
  if (c === '눈') return 'effect-snow'
  if (c === '구름많음' || c === '흐림') return 'effect-cloud'
  return ''
})

// 날씨 조건 + 시간대 결합 배경
const weatherCardClass = computed(() => {
  const c = weatherData.value.condition
  const isDay = timeOfDayClass.value === 'theme-day'
  if (c === '맑음' || c === '구름조금') return isDay ? 'wx-sunny-day' : 'wx-sunny-night'
  if (c === '구름많음') return isDay ? 'wx-partcloud-day' : 'wx-partcloud-night'
  if (c === '흐림') return isDay ? 'wx-cloudy-day' : 'wx-cloudy-night'
  if (c === '비' || c === '소나기') return isDay ? 'wx-rain-day' : 'wx-rain-night'
  if (c === '비/눈') return 'wx-sleet'
  if (c === '눈') return isDay ? 'wx-snow-day' : 'wx-snow-night'
  return isDay ? 'wx-default-day' : 'wx-default-night'
})

const particleContainer = ref(null)
let particleTimer = null

watch(weatherEffectClass, (val) => {
  if (particleTimer) clearInterval(particleTimer)
  if (particleContainer.value) particleContainer.value.innerHTML = ''
  
  if (val === 'effect-rain' || val === 'effect-snow') {
    startParticles(val)
  }
})

function startParticles(type) {
  const container = particleContainer.value
  if (!container) return
  
  const isRain = type === 'effect-rain'
  
  const createDrop = () => {
    const drop = document.createElement('div')
    drop.classList.add(isRain ? 'raindrop' : 'snowdrop')
    drop.style.left = `${Math.random() * 100}%`
    
    // 눈은 더 천천히, 비는 꽤 빠르게
    drop.style.animationDuration = isRain ? `${Math.random() * 0.4 + 0.4}s` : `${Math.random() * 2 + 3}s`
    
    container.appendChild(drop)
    
    // 애니메이션 종료 시 DOM에서 제거하여 메모리 관리
    drop.addEventListener('animationend', () => {
      drop.remove()
    })
  }

  // 화면이 처음에 텅 비지 않도록 미리 생성
  for(let i=0; i< (isRain ? 40 : 20); i++) {
    createDrop()
  }

  // 생성 주기: 비는 40ms, 눈은 200ms
  particleTimer = setInterval(createDrop, isRain ? 40 : 200)
}

const weatherEmoji = computed(() => {
  return getWeatherEmoji(weatherData.value.condition)
})

watch(selectedRegion, () => {
  fetchWeather()
})

const todayDate = ref(new Date())
let todayTimer = null
const currentMonth = ref(new Date(todayDate.value.getFullYear(), todayDate.value.getMonth(), 1))

const selectedDate = computed({
  get: () => new Date(selectedDateStr.value),
  set: (date) => { selectedDateStr.value = formatDate(date) }
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
    
    const dateStr = formatDate(date)
    const hasTodos = todosByDate.value[dateStr] && todosByDate.value[dateStr].length > 0

    return {
      key: dateStr,
      label: date.getDate(),
      date,
      hasTodos,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDate(date, todayDate.value),
      isSelected: dateStr === selectedDateStr.value,
    }
  })
})

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
  currentMonth.value = new Date(todayDate.value.getFullYear(), todayDate.value.getMonth(), 1)
  selectedDate.value = new Date(todayDate.value.getFullYear(), todayDate.value.getMonth(), todayDate.value.getDate())
}

onMounted(() => {
  fetchWeather()
  todayTimer = setInterval(() => {
    todayDate.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (particleTimer) clearInterval(particleTimer)
  if (todayTimer) clearInterval(todayTimer)
})
</script>

<template>
  <article class="panel weather-panel">
    <div class="panel-header">
      <div>
        <h1 class="gradient-text">WEATHER</h1>
      </div>
      <div class="header-right">
        <button type="button" class="region-button" @click="showRegionModal = true">
          📍 {{ selectedRegion.name }}
        </button>
        <div class="weather-icon">{{ weatherEmoji }}</div>
      </div>
    </div>

    <!-- 1. 메인 (초단기) 날씨 영역 -->
    <section class="weather-card" :class="[weatherCardClass, weatherEffectClass]">
      <!-- JS Particle Animation Container -->
      <div ref="particleContainer" class="particle-container" v-show="weatherEffectClass === 'effect-rain' || weatherEffectClass === 'effect-snow'"></div>

      <!-- 에러 상태 안내 -->
      <div v-if="weatherError" class="weather-error">
        <span class="weather-error-icon">⚠️</span>
        <div>
          <p class="weather-error-title">날씨 정보를 불러오지 못했습니다</p>
          <p class="weather-error-sub">잠시 후 다시 시도해 주세요</p>
        </div>
        <button type="button" class="weather-retry-btn" @click="fetchWeather">다시 시도</button>
      </div>

      <div class="weather-main" v-else>
        <div>
          <p class="city">{{ selectedRegion.name }}</p>
          <p class="condition">{{ weatherData.condition }}</p>
        </div>
        <p class="temperature">{{ weatherData.temperature }}<span v-if="weatherData.temperature !== '--'">°C</span></p>
      </div>
      <p class="weather-summary" v-if="!weatherError">{{ weatherData.summary }}</p>
      <p class="fetched-at" v-if="!weatherError">업데이트: {{ weatherData.fetchedAt }}</p>
    </section>

    <!-- 2. 단기예보 하단 스크롤 리스트 -->
    <section class="forecast-section" v-if="forecastList.length > 0">
      <p class="forecast-title">시간대별 일기예보</p>
      <div class="forecast-list">
        <div v-for="(f, idx) in forecastList" :key="idx" class="forecast-item">
          <p class="time">{{ f.timeLabel }}</p>
          <p class="icon" :title="f.condition">{{ f.emoji }}</p>
          <p class="temp">{{ f.temp }}°</p>
          <p class="pop" v-if="f.pop"><i class="drop-icon">💧</i>{{ f.pop }}%</p>
        </div>
      </div>
    </section>

    <!-- 3. 기존 달력 영역 -->
    <section class="calendar-section">
      <div class="calendar-header">
        <div class="calendar-title-group">
          <p class="calendar-title">
            Calendar
            <button class="dday-badge" type="button" @click="showDDayModal = true" title="디데이 설정">
              <template v-if="globalDDay">
                <span class="dday-name">{{ globalDDay.title }}</span>
                <span class="dday-text">{{ getDDayText(globalDDay.date) }}</span>
              </template>
              <span v-else class="dday-empty">+ 디데이 추가</span>
            </button>
          </p>
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
          <span>{{ day.label }}</span>
          <span v-if="day.hasTodos" class="todo-dot"></span>
        </button>
      </div>
    </section>

    <!-- D-Day Modal -->
    <div v-if="showDDayModal" class="modal-overlay" @click.self="showDDayModal = false">
      <div class="modal-content">
        <h3>디데이 설정 🎯</h3>
        <div class="modal-form">
          <label>
            <span>목표 이름</span>
            <input v-model="ddayInput.title" type="text" placeholder="예: 시험, 시작일" />
          </label>
          <label>
            <span>목표 날짜</span>
            <input v-model="ddayInput.date" type="date" />
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-clear" @click="clearDDay" v-if="globalDDay">디데이 삭제</button>
          <div class="modal-right-actions">
            <button type="button" class="btn-cancel" @click="showDDayModal = false">취소</button>
            <button type="button" class="btn-save" @click="saveDDay">저장</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Region Modal -->
    <div v-if="showRegionModal" class="modal-overlay" @click.self="showRegionModal = false">
      <div class="modal-content region-modal-content">
        <h3>지역 선택 🗺️</h3>
        <div class="region-grid">
          <button 
            v-for="r in REGIONS" 
            :key="r.name" 
            type="button"
            class="region-item" 
            :class="{ active: r.name === selectedRegion.name }"
            @click="pickRegion(r)"
          >
            {{ r.name }}
          </button>
        </div>
        <div class="modal-actions" style="justify-content: flex-end;">
          <button type="button" class="btn-cancel" @click="showRegionModal = false">닫기</button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>

.weather-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background:
    radial-gradient(circle at top right, rgba(109, 167, 242, 0.18), transparent 30%),
    var(--panel-bg);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.region-button {
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--panel-border);
  background: var(--input-bg);
  color: var(--color-heading);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px var(--shadow-color);
  transition: all 0.22s ease;
  font-family: inherit;
}

.region-button:hover {
  background: var(--item-hover);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 날씨 에러 UI */
.weather-error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.weather-error-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.weather-error-title {
  font-weight: 700;
  font-size: 0.95rem;
}

.weather-error-sub {
  font-size: 0.82rem;
  opacity: 0.75;
  margin-top: 2px;
}

.weather-retry-btn {
  margin-left: auto;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  flex-shrink: 0;
}

.weather-retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.region-modal-content {
  max-width: 380px;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.region-item {
  padding: 10px 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--color-text);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.22s ease;
}

.region-item:hover {
  background: var(--item-hover);
}

.region-item.active {
  background: var(--zen-blue-600, #035AA6);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(3, 90, 166, 0.25);
}

.gradient-text {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.weather-icon {
  font-size: 2.2rem;
}

.weather-card {
  margin-top: 6px;
  padding: 22px;
  border-radius: var(--radius-lg);
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

/* ── 날씨 조건별 배경 (낮) ── */
/* 맑음 낮 — 따뜻한 하늘 */
.weather-card.wx-sunny-day {
  color: #1a3a00;
  background: linear-gradient(150deg, #87CEEB, #FFD166, #FFB347);
  box-shadow: inset 0 2px 14px rgba(255, 255, 255, 0.4);
}
.weather-card.wx-sunny-day .condition,
.weather-card.wx-sunny-day .weather-summary,
.weather-card.wx-sunny-day .fetched-at { color: rgba(30, 60, 0, 0.68); }

/* 구름조금 낮 */
.weather-card.wx-partcloud-day {
  color: #023373;
  background: linear-gradient(135deg, #CEDEF2, #A0C4F2, #6DA7F2);
  box-shadow: inset 0 2px 12px rgba(255, 255, 255, 0.4);
}
.weather-card.wx-partcloud-day .condition,
.weather-card.wx-partcloud-day .weather-summary,
.weather-card.wx-partcloud-day .fetched-at { color: rgba(2, 51, 115, 0.7); }

/* 흐림 낮 */
.weather-card.wx-cloudy-day {
  color: #1e2d3d;
  background: linear-gradient(135deg, #8FA8C0, #7090A8, #5A7A94);
}
.weather-card.wx-cloudy-day .condition,
.weather-card.wx-cloudy-day .weather-summary,
.weather-card.wx-cloudy-day .fetched-at { color: rgba(30, 45, 61, 0.7); }

/* 비 낮 */
.weather-card.wx-rain-day {
  color: #e8f0fb;
  background: linear-gradient(135deg, #3A5F8A, #2C4A72, #1E3558);
}
.weather-card.wx-rain-day .condition,
.weather-card.wx-rain-day .weather-summary,
.weather-card.wx-rain-day .fetched-at { color: rgba(206, 222, 242, 0.78); }

/* 눈 낮 */
.weather-card.wx-snow-day {
  color: #0a2040;
  background: linear-gradient(135deg, #D6EAF8, #BDD7EE, #A3C4E4);
  box-shadow: inset 0 2px 12px rgba(255, 255, 255, 0.5);
}
.weather-card.wx-snow-day .condition,
.weather-card.wx-snow-day .weather-summary,
.weather-card.wx-snow-day .fetched-at { color: rgba(10, 32, 64, 0.65); }

/* ── 날씨 조건별 배경 (밤) ── */
/* 맑음 밤 — 깊은 자주빛 하늘 */
.weather-card.wx-sunny-night {
  color: #f0e8ff;
  background: linear-gradient(135deg, #0D0820, #1C0D4A, #2D1070);
}
.weather-card.wx-sunny-night .condition,
.weather-card.wx-sunny-night .weather-summary,
.weather-card.wx-sunny-night .fetched-at { color: rgba(224, 210, 255, 0.75); }

/* 구름많음 밤 */
.weather-card.wx-partcloud-night {
  color: #e8f0fb;
  background: linear-gradient(135deg, #0E155E, #023373, #035AA6);
}
.weather-card.wx-partcloud-night .condition,
.weather-card.wx-partcloud-night .weather-summary,
.weather-card.wx-partcloud-night .fetched-at { color: rgba(206, 222, 242, 0.78); }

/* 흐림 밤 */
.weather-card.wx-cloudy-night {
  color: #c8d8e8;
  background: linear-gradient(135deg, #1C2535, #243345, #2C3F55);
}
.weather-card.wx-cloudy-night .condition,
.weather-card.wx-cloudy-night .weather-summary,
.weather-card.wx-cloudy-night .fetched-at { color: rgba(200, 216, 232, 0.72); }

/* 비 밤 */
.weather-card.wx-rain-night {
  color: #b0c8e0;
  background: linear-gradient(135deg, #0A1628, #10243E, #162E50);
}
.weather-card.wx-rain-night .condition,
.weather-card.wx-rain-night .weather-summary,
.weather-card.wx-rain-night .fetched-at { color: rgba(176, 200, 224, 0.72); }

/* 눈 밤 */
.weather-card.wx-snow-night {
  color: #c8dff0;
  background: linear-gradient(135deg, #141F35, #1A2A4A, #203360);
}
.weather-card.wx-snow-night .condition,
.weather-card.wx-snow-night .weather-summary,
.weather-card.wx-snow-night .fetched-at { color: rgba(200, 223, 240, 0.72); }

/* 진눈깨비 */
.weather-card.wx-sleet {
  color: #d0dff0;
  background: linear-gradient(135deg, #3A5070, #4A6080, #56708A);
}
.weather-card.wx-sleet .condition,
.weather-card.wx-sleet .weather-summary,
.weather-card.wx-sleet .fetched-at { color: rgba(208, 223, 240, 0.75); }

/* 기본 (데이터 없을 때) */
.weather-card.wx-default-day {
  color: #023373;
  background: linear-gradient(135deg, #CEDEF2, #A0C4F2, #6DA7F2);
}
.weather-card.wx-default-day .condition,
.weather-card.wx-default-day .weather-summary,
.weather-card.wx-default-day .fetched-at { color: rgba(2, 51, 115, 0.7); }

.weather-card.wx-default-night {
  color: #e8f0fb;
  background: linear-gradient(135deg, #0E155E, #023373, #035AA6);
}
.weather-card.wx-default-night .condition,
.weather-card.wx-default-night .weather-summary,
.weather-card.wx-default-night .fetched-at { color: rgba(206, 222, 242, 0.8); }


/* z-index to bring text above animations */
.weather-main, .weather-summary, .fetched-at {
  position: relative;
  z-index: 2;
}

/* 파티클 효과 컨테이너 */
.particle-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

:deep(.raindrop) {
  position: absolute;
  top: -20px;
  width: 2px;
  height: 25px;
  background: rgba(255, 255, 255, 0.7);
  transform: rotate(15deg);
  animation: fall-rain linear forwards;
}

:deep(.snowdrop) {
  position: absolute;
  top: -20px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
  animation: fall-snow linear forwards;
}

@keyframes fall-rain {
  from { transform: rotate(15deg) translateY(-20px); }
  to { transform: rotate(15deg) translateY(400px); }
}

@keyframes fall-snow {
  from { transform: translateY(-20px) rotate(0deg); }
  to { transform: translateY(400px) rotate(360deg); }
}

/* 구름 낀 효과 애니메이션 */
.effect-cloud::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%);
  animation: pulse-cloud 4s ease-in-out infinite alternate;
  z-index: 1;
}

@keyframes pulse-cloud {
  0% { transform: scale(1) translateX(0); opacity: 0.5; }
  100% { transform: scale(1.1) translateX(-10px); opacity: 0.8; }
}

.city {
  font-size: 1.4rem;
  font-weight: 800;
}

.condition {
  margin-top: 4px;
}

.temperature {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.25;
}

.temperature span {
  font-size: 1.8rem;
  margin-left: 2px;
}

.weather-summary,
.fetched-at {
  margin-top: 8px;
}

.weather-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

/* 단기예보 리스트 스타일 */
.forecast-section {
  padding: 18px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  flex-shrink: 0;
}

.forecast-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 12px;
  letter-spacing: 0.04em;
}

.forecast-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(109, 167, 242, 0.3) transparent;
}

.forecast-list::-webkit-scrollbar {
  height: 5px;
}

.forecast-list::-webkit-scrollbar-track {
  background: transparent;
}

.forecast-list::-webkit-scrollbar-thumb {
  background-color: rgba(109, 167, 242, 0.35);
  border-radius: 10px;
}

.forecast-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 12px 0;
  background: var(--input-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.forecast-item .time {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 6px;
}

.forecast-item .icon {
  font-size: 1.4rem;
  margin-bottom: 6px;
}

.forecast-item .temp {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
}

.forecast-item .pop {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0284c7;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.drop-icon {
  font-style: normal;
  font-size: 0.7rem;
}

/* 달력 스타일 */
.calendar-section {
  margin-top: auto;
  padding: 18px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
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
  color: var(--color-heading);
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
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.calendar-nav,
.calendar-today {
  padding: 9px 12px;
  color: var(--color-text);
  background: var(--input-bg);
  box-shadow: inset 0 0 0 1px var(--panel-border);
  transition: all 0.22s ease;
}

.calendar-nav:hover,
.calendar-today:hover {
  background: var(--item-hover);
}

.calendar-nav {
  min-width: 40px;
}

.selected-date {
  margin-top: 14px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted);
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
}

.calendar-weekdays {
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 0.82rem;
  text-align: center;
}

.calendar-weekdays span {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 22px;
  font-weight: 600;
}

.calendar-grid {
  margin-top: 6px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 0;
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--input-bg);
  box-shadow: inset 0 0 0 1px var(--panel-border);
  transition: all 0.22s ease;
}

.calendar-day:hover {
  background: var(--item-hover);
  transform: scale(1.04);
}

.calendar-day.muted {
  color: #94a3b8;
  background: transparent;
}

.calendar-day.today {
  box-shadow: inset 0 0 0 2px var(--zen-blue-300, #6DA7F2);
}

.calendar-day.selected {
  color: #e8f0fb;
  background: linear-gradient(135deg, var(--zen-blue-600, #035AA6), var(--zen-periwinkle, #7997E6));
  box-shadow: 0 4px 12px rgba(3, 90, 166, 0.3);
  transform: scale(1.06);
}

/* 달력 할 일 점 표시기 */
.todo-dot {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #3b82f6; /* 기본 파란색 점 */
  margin-top: 2px;
}

/* 선택된 날짜나 오늘인 경우 점 색상을 대비감 있게 변경 */
.calendar-day.selected .todo-dot {
  background-color: #ffffff;
}
.calendar-day.today.selected .todo-dot {
  background-color: #ffffff;
}
.calendar-day.today:not(.selected) .todo-dot {
  background-color: #0284c7;
}

@media (max-width: 640px) {
  .weather-main {
    flex-direction: column;
    gap: 8px;
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

/* 글로벌 디데이 및 모달 스타일 */
.calendar-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dday-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: none;
  border-radius: var(--radius-pill);
  background: rgba(109, 167, 242, 0.15);
  color: var(--zen-blue-600, #035AA6);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(109, 167, 242, 0.35);
  transition: all 0.22s ease;
  font-family: inherit;
}

.dday-badge:hover {
  background: rgba(109, 167, 242, 0.25);
}

.dday-name {
  color: var(--zen-periwinkle, #7997E6);
  font-weight: 700;
}

.dday-empty {
  color: var(--text-muted);
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  padding: 26px;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 20px 48px var(--shadow-color);
  backdrop-filter: blur(20px);
  border: 1px solid var(--panel-border);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: var(--color-heading);
  font-weight: 700;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
}

.modal-form input {
  padding: 11px 14px;
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  font: inherit;
  color: var(--color-text);
  transition: all 0.22s ease;
}

.modal-form input:focus {
  outline: none;
  border-color: var(--zen-blue-300, #6DA7F2);
  box-shadow: 0 0 0 3px rgba(109, 167, 242, 0.16);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

.modal-actions:has(.btn-clear) {
  justify-content: space-between;
}

.modal-right-actions {
  display: flex;
  gap: 8px;
}

.btn-clear, .btn-cancel, .btn-save {
  padding: 9px 16px;
  border: none;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.22s ease;
  font-size: 0.9rem;
}

.btn-clear  { background: rgba(179, 122, 212, 0.15); color: var(--zen-verbena, #B37AD4); }
.btn-clear:hover  { background: rgba(179, 122, 212, 0.28); }
.btn-cancel { background: var(--item-bg); color: var(--text-muted); }
.btn-cancel:hover { background: var(--item-hover); }
.btn-save   { background: var(--zen-blue-600, #035AA6); color: #fff; box-shadow: 0 4px 12px rgba(3,90,166,0.22); }
.btn-save:hover   { background: var(--zen-blue-900, #023373); }
</style>
