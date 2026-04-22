<script setup>
import { ref } from 'vue'

const keyword = ref('')
const isLoading = ref(false)
const newsData = ref(null)
const errorMsg = ref('')

async function fetchNews() {
  isLoading.value = true
  errorMsg.value = ''
  newsData.value = null
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const url = `${baseUrl}/api/news?keyword=${encodeURIComponent(keyword.value)}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('뉴스를 가져오는데 실패했습니다.')
    }
    const data = await response.json()
    newsData.value = data
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="panel news-panel">
    <header class="panel-header">
      <h2>📰 오늘의 뉴스 요약</h2>
      <p class="subtitle">AI가 최신 트렌드를 분석해 드립니다</p>
    </header>
    
    <div class="search-box">
      <input 
        v-model="keyword" 
        @keyup.enter="fetchNews" 
        placeholder="관심 키워드 (비워두면 종합 뉴스)"
        class="search-input"
        :disabled="isLoading"
      />
      <button @click="fetchNews" class="btn btn-primary" :disabled="isLoading">
        <span v-if="isLoading">⏳ 분석 중...</span>
        <span v-else>요약하기</span>
      </button>
    </div>

    <div v-if="errorMsg" class="error-msg">
      ⚠️ {{ errorMsg }}
    </div>

    <div v-if="newsData" class="news-content">
      <div class="summary-box">
        <h3>✨ AI 인사이트</h3>
        <div class="summary-text">{{ newsData.summary }}</div>
      </div>
      
      <div class="news-list-box">
        <h3>🔗 수집된 뉴스 요약 원문 목록</h3>
        <ul class="news-list">
          <li v-for="(news, index) in newsData.news_list" :key="index">
            <a :href="news.link" target="_blank" rel="noopener noreferrer">{{ index + 1 }}. {{ news.title }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-heading);
}

.subtitle {
  color: var(--color-text-mute);
  font-size: 0.9rem;
  margin-top: 4px;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 1rem;
}

.search-input:focus {
  outline: 2px solid #6366f1;
  border-color: transparent;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-box {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.summary-box h3 {
  margin: 0 0 16px 0;
  color: #8b5cf6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-text);
}

.news-list-box {
  padding: 0 10px;
}

.news-list-box h3 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: var(--color-heading);
}

.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-list li a {
  color: var(--color-text);
  text-decoration: none;
  line-height: 1.4;
  display: block;
  transition: color 0.2s ease;
}

.news-list li a:hover {
  color: #6366f1;
}
</style>
