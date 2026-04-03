<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { selectedDateStr, todosByDate, formatDate, globalDDay, getDDayText } from '../store.js'

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

const serviceKeyGlobal = import.meta.env.VITE_KMA_API_KEY

const regions = [
  { name: '서울', nx: 60, ny: 127 },
  { name: '부산', nx: 98, ny: 76 },
  { name: '제주', nx: 52, ny: 38 },
  { name: '인천', nx: 55, ny: 124 },
  { name: '대구', nx: 89, ny: 90 },
  { name: '대전', nx: 67, ny: 106 },
  { name: '광주', nx: 58, ny: 74 },
  { name: '울산', nx: 102, ny: 84 },
  { name: '창원', nx: 90, ny: 77 },
  { name: '강릉', nx: 92, ny: 131 },
  { name: '춘천', nx: 73, ny: 134 },
  { name: '청주', nx: 69, ny: 107 },
  { name: '전주', nx: 63, ny: 89 }
]

// 저장된 지역 불러오기
const savedRegion = localStorage.getItem('studyjs-weather-region')
let initialRegion = regions[0]
if (savedRegion) {
  try {
    const parsed = JSON.parse(savedRegion)
    const found = regions.find(r => r.name === parsed.name)
    if (found) initialRegion = found
  } catch (e) {}
}

const selectedRegion = ref(initialRegion)

function pickRegion(r) {
  selectedRegion.value = r
  showRegionModal.value = false
}

const weatherData = ref({
  temperature: '--',
  condition: '로딩중',
  summary: '날씨 정보를 불러오는 중입니다...',
  fetchedAt: '--',
})

const forecastList = ref([])

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

function getWeatherEmoji(condition) {
  const iconMap = {
    맑음: '☀️',
    구름많음: '⛅',
    흐림: '☁️',
    비: '🌧️',
    '비/눈': '🌨️',
    눈: '❄️',
    소나기: '🌦️',
    로딩중: '⏳',
  }
  return iconMap[condition] ?? '🌤️'
}

function parseCondition(pty, sky) {
  let condition = '맑음'
  if (pty !== '0') {
    if (pty === '1' || pty === '5') condition = '비'
    else if (pty === '4') condition = '소나기'
    else if (pty === '2' || pty === '6') condition = '비/눈' 
    else if (pty === '3' || pty === '7') condition = '눈'
  } else {
    if (sky === '1') condition = '맑음'
    else if (sky === '3') condition = '구름많음'
    else if (sky === '4') condition = '흐림'
  }
  return condition
}

async function fetchWeather() {
  weatherData.value.condition = '로딩중'
  weatherData.value.summary = '날씨를 갱신하고 있습니다...'
  await Promise.all([fetchCurrentWeather(), fetchShortTermForecast()]);
}

// 1. 현재 날씨 상태 (초단기예보 getUltraSrtFcst 활용)
async function fetchCurrentWeather() {
  try {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let date = now.getDate()
    let hours = now.getHours()
    let minutes = now.getMinutes()

    if (minutes < 45) {
      hours -= 1
      if (hours < 0) {
        hours = 23
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        year = yesterday.getFullYear()
        month = yesterday.getMonth() + 1
        date = yesterday.getDate()
      }
    }
    
    const baseDate = `${year}${String(month).padStart(2, '0')}${String(date).padStart(2, '0')}`
    const baseTime = `${String(hours).padStart(2, '0')}30`
    const { nx, ny } = selectedRegion.value
    
    let url = ''
    if (import.meta.env.DEV) {
      const serviceKey = import.meta.env.VITE_KMA_API_KEY || ''
      url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=60&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`
    } else {
      url = `/api/weather?type=ultra&pageNo=1&numOfRows=60&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`
    }

    const response = await fetch(url)
    const json = await response.json()

    if (json.response?.header?.resultCode === '00') {
      const items = json.response.body.items.item
      
      let t1h = null, sky = null, pty = null
      
      for (const item of items) {
        if (item.category === 'T1H' && !t1h) t1h = item.fcstValue
        if (item.category === 'SKY' && !sky) sky = item.fcstValue
        if (item.category === 'PTY' && !pty) pty = item.fcstValue
      }

      const condition = parseCondition(pty, sky)

      weatherData.value = {
        temperature: t1h,
        condition,
        summary: `현재 기온은 ${t1h}°C이며, 하늘 상태는 '${condition}'입니다.`,
        fetchedAt: now.toLocaleString('ko-KR', {
          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        }),
      }
    }
  } catch (error) {
    console.error('Fetch current weather failed:', error)
  }
}

// 2. 단기예보 리스트 (단기예보 getVilageFcst 활용)
async function fetchShortTermForecast() {
  try {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let date = now.getDate()
    let hours = now.getHours()
    let minutes = now.getMinutes()

    const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23]
    let baseHour = hours
    
    if (minutes < 15) baseHour -= 1
    if (baseHour < 0) {
      baseHour += 24
      now.setDate(now.getDate() - 1)
      year = now.getFullYear()
      month = now.getMonth() + 1
      date = now.getDate()
    }

    let validBaseHour = baseTimes.slice().reverse().find(h => baseHour >= h)
    if (validBaseHour === undefined) {
      validBaseHour = 23
      now.setDate(now.getDate() - 1)
      year = now.getFullYear()
      month = now.getMonth() + 1
      date = now.getDate()
    }

    const baseDate = `${year}${String(month).padStart(2, '0')}${String(date).padStart(2, '0')}`
    const baseTime = `${String(validBaseHour).padStart(2, '0')}00`
    const { nx, ny } = selectedRegion.value

    let url = ''
    if (import.meta.env.DEV) {
      const serviceKey = import.meta.env.VITE_KMA_API_KEY || ''
      url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=120&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`
    } else {
      url = `/api/weather?type=vilage&pageNo=1&numOfRows=120&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`
    }

    const response = await fetch(url)
    const json = await response.json()

    if (json.response?.header?.resultCode === '00') {
      const items = json.response.body.items.item
      
      const forecastMap = {}
      for (const item of items) {
        const key = `${item.fcstDate}${item.fcstTime}`
        if (!forecastMap[key]) forecastMap[key] = { time: item.fcstTime, date: item.fcstDate }
        if (item.category === 'TMP') forecastMap[key].tmp = item.fcstValue
        if (item.category === 'SKY') forecastMap[key].sky = item.fcstValue
        if (item.category === 'PTY') forecastMap[key].pty = item.fcstValue
        if (item.category === 'POP') forecastMap[key].pop = item.fcstValue 
      }

      const sortedKeys = Object.keys(forecastMap).sort()
      const currentFullTimeStr = `${year}${String(month).padStart(2, '0')}${String(date).padStart(2, '0')}${String(hours).padStart(2, '0')}00`
      const upcoming = sortedKeys
        .filter(k => k >= currentFullTimeStr)
        .map(k => forecastMap[k])
        .filter(f => f.tmp !== undefined)
        .slice(0, 10)

      forecastList.value = upcoming.map(f => {
        const condition = parseCondition(f.pty, f.sky)
        const timeLabel = `${parseInt(f.time.slice(0, 2))}시`
        return {
          timeLabel,
          temp: f.tmp,
          condition,
          emoji: getWeatherEmoji(condition),
          pop: f.pop && f.pop !== '0' ? f.pop : null
        }
      })
    }
  } catch (error) {
    console.error('Fetch short term forecast failed:', error)
  }
}

watch(selectedRegion, (newRegion) => {
  localStorage.setItem('studyjs-weather-region', JSON.stringify(newRegion))
  fetchWeather()
})

const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

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
      isToday: isSameDate(date, today),
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

onMounted(() => {
  fetchWeather()
})
</script>

<template>
  <article class="panel weather-panel">
    <div class="panel-header">
      <div>
        <h2 class="gradient-text">Weather</h2>
      </div>
      <div class="header-right">
        <button type="button" class="region-button" @click="showRegionModal = true">
          📍 {{ selectedRegion.name }}
        </button>
        <div class="weather-icon">{{ weatherEmoji }}</div>
      </div>
    </div>

    <!-- 1. 메인 (초단기) 날씨 영역 -->
    <section class="weather-card" :class="[timeOfDayClass, weatherEffectClass]">
      <!-- JS Particle Animation Container -->
      <div ref="particleContainer" class="particle-container" v-show="weatherEffectClass === 'effect-rain' || weatherEffectClass === 'effect-snow'"></div>

      <div class="weather-main">
        <div>
          <p class="city">{{ selectedRegion.name }}</p>
          <p class="condition">{{ weatherData.condition }}</p>
        </div>
        <p class="temperature">{{ weatherData.temperature }}<span v-if="weatherData.temperature !== '--'">°C</span></p>
      </div>
      <p class="weather-summary">{{ weatherData.summary }}</p>
      <p class="fetched-at">업데이트: {{ weatherData.fetchedAt }}</p>
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
            v-for="r in regions" 
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
.panel {
  height: 100%;
  padding: 24px;
  border: 1px solid var(--panel-border);
  border-radius: 24px;
  background: var(--panel-bg);
  box-shadow: 0 20px 45px var(--shadow-color);
}

.weather-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background:
    radial-gradient(circle at top right, rgba(125, 211, 252, 0.28), transparent 28%),
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
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid var(--panel-border);
  background: var(--input-bg);
  color: var(--color-heading);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 5px var(--shadow-color);
  transition: all 0.2s;
}

.region-button:hover {
  background: var(--item-hover);
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
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.region-item:hover {
  background: var(--item-hover);
}

.region-item.active {
  background: #3b82f6;
  color: #fff;
  border-color: #2563eb;
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
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
}

/* 밤 테마 (어두움) */
.weather-card.theme-night {
  color: #eff6ff;
  background: linear-gradient(135deg, #0f172a, #0369a1);
}

.weather-card.theme-night .condition,
.weather-card.theme-night .weather-summary,
.weather-card.theme-night .fetched-at {
  color: rgba(239, 246, 255, 0.84);
}

/* 낮 테마 (밝음) */
.weather-card.theme-day {
  color: #0f172a;
  background: linear-gradient(135deg, #e0f2fe, #7dd3fc);
  box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.5);
}

.weather-card.theme-day .condition,
.weather-card.theme-day .weather-summary,
.weather-card.theme-day .fetched-at {
  color: rgba(15, 23, 42, 0.75);
}

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
  line-height: 1.1;
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
  border-radius: 22px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
}

.forecast-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-heading);
  margin-bottom: 12px;
}

.forecast-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

.forecast-list::-webkit-scrollbar {
  height: 6px;
}

.forecast-list::-webkit-scrollbar-track {
  background: transparent;
}

.forecast-list::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.4);
  border-radius: 10px;
}

.forecast-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 12px 0;
  background: var(--input-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  box-shadow: 0 4px 12px var(--shadow-color);
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
  border-radius: 22px;
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
  border-radius: 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.calendar-nav,
.calendar-today {
  padding: 10px 12px;
  color: var(--color-text);
  background: var(--input-bg);
  box-shadow: inset 0 0 0 1px var(--panel-border);
  transition: all 0.2s ease;
}

.calendar-nav:hover,
.calendar-today:hover {
  background: var(--item-hover);
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 0;
  border-radius: 18px;
  color: var(--color-text);
  background: var(--input-bg);
  box-shadow: inset 0 0 0 1px var(--panel-border);
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background: var(--item-hover);
}

.calendar-day.muted {
  color: #94a3b8;
  background: transparent;
}

.calendar-day.today {
  box-shadow: inset 0 0 0 2px #38bdf8;
}

.calendar-day.selected {
  color: #eff6ff;
  background: linear-gradient(135deg, #0284c7, #2563eb);
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
  padding: 4px 10px;
  border: none;
  border-radius: 12px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

.dday-badge:hover {
  background: #dbeafe;
}

.dday-name {
  color: #3b82f6;
  font-weight: 700;
}

.dday-empty {
  color: #64748b;
  font-weight: 600;
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
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 20px 40px var(--shadow-color);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: var(--color-heading);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #475569;
}

.modal-form input {
  padding: 12px;
  border: 1px solid var(--input-border);
  border-radius: 12px;
  background: var(--input-bg);
  font: inherit;
  color: var(--color-text);
}

.modal-form input:focus {
  outline: 2px solid rgba(59, 130, 246, 0.3);
  border-color: #60a5fa;
  background: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.modal-actions:has(.btn-clear) {
  justify-content: space-between;
}

.modal-right-actions {
  display: flex;
  gap: 8px;
}

.btn-clear, .btn-cancel, .btn-save {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-clear { background: #fee2e2; color: #dc2626; }
.btn-clear:hover { background: #fca5a5; }
.btn-cancel { background: #e2e8f0; color: #475569; }
.btn-cancel:hover { background: #cbd5e1; }
.btn-save { background: #3b82f6; color: #fff; }
.btn-save:hover { background: #2563eb; }
</style>
