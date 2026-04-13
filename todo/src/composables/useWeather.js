import { ref, computed } from 'vue'

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

export function getWeatherEmoji(condition) {
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

export function useWeather(selectedRegion) {
  const weatherData = ref({
    temperature: '--',
    condition: '로딩중',
    summary: '날씨 정보를 불러오는 중입니다...',
    fetchedAt: '--',
  })

  const forecastList = ref([])
  const weatherError = ref(false)

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
      weatherError.value = true
      weatherData.value = {
        temperature: '--',
        condition: '오류',
        summary: '날씨 정보를 불러오지 못했습니다.',
        fetchedAt: '--',
      }
    }
  }

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
      weatherError.value = true
    }
  }

  async function fetchWeather() {
    weatherData.value.condition = '로딩중'
    weatherData.value.summary = '날씨를 갱신하고 있습니다...'
    weatherError.value = false
    await Promise.all([fetchCurrentWeather(), fetchShortTermForecast()]);
  }

  return {
    weatherData,
    forecastList,
    weatherError,
    fetchWeather
  }
}
