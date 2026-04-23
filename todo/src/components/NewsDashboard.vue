<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

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

const renderedSummary = computed(() => {
  if (!newsData.value || !newsData.value.summary) return ''
  return marked.parse(newsData.value.summary)
})
</script>

<template>
  <div class="panel news-panel">
    <header class="panel-header">
      <div class="title-group">
        <h1 class="gradient-text">TODAY NEWS</h1>
      </div>
      
      <p class="subtitle"> AI가 최신 뉴스를 요약해 드립니다</p> 
    </header>
    
    <div class="search-box">
      <input 
        v-model="keyword" 
        @keyup.enter="fetchNews" 
        placeholder="관심 키워드를 입력하세요 (비워두면 종합 뉴스로 검색합니다)"
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
        <div class="summary-text" v-html="renderedSummary"></div>
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
  padding-left: 30px; /* 사이드바와 입력창 사이의 간격 확보 */
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  margin-bottom: 20px; /* 제목과 소제목 사이 간격을 더 넓게 */
}

.header-emoji {
  font-size: 2.2rem;
}

.gradient-text {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
}

.subtitle {
  color: var(--color-text-mute);
  font-size: 0.9rem;
  font-weight: 500;
  text-indent: 0.5em;
  margin-top: 0;
  margin-bottom: 12px; /* 소제목과 입력창 사이 간격은 좁게 */
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
  line-height: 1.6;
  color: var(--color-text);
}

.summary-text :deep(strong) {
  font-weight: 700;
  color: var(--color-heading);
}

.summary-text :deep(p) {
  margin-bottom: 12px;
}
.summary-text :deep(ul) {
  padding-left: 20px;
  margin-bottom: 12px;
}
.summary-text :deep(li) {
  margin-bottom: 8px;
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
