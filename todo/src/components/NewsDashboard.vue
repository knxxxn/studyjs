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
        <span v-if="isLoading">⏳ 분석중...</span>
        <span v-else>요약</span>
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
}

@media (min-width: 860px) {
  .news-panel {
    padding-left: 28px;
  }
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  margin-bottom: 16px;
}

.gradient-text {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 500;
  text-indent: 0.5em;
  margin-top: 0;
  margin-bottom: 10px;
  letter-spacing: 0.03em;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--input-border);
  background: var(--input-bg);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.22s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--zen-blue-300, #6DA7F2);
  box-shadow: 0 0 0 3px rgba(109, 167, 242, 0.18);
}

.search-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.btn {
  padding: 12px 22px;
  border-radius: var(--radius-pill);
  border: none;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.btn-primary {
  background: var(--zen-blue-600, #035AA6);
  color: white;
  box-shadow: 0 4px 14px rgba(3, 90, 166, 0.22);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 6px 18px rgba(3, 90, 166, 0.32);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  padding: 12px 16px;
  background: rgba(179, 122, 212, 0.1);
  color: var(--zen-verbena, #B37AD4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(179, 122, 212, 0.25);
  font-size: 0.9rem;
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.summary-box {
  background: var(--item-bg);
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
}

.summary-box h3 {
  margin: 0 0 14px 0;
  color: var(--zen-periwinkle, #7997E6);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
}

.summary-text {
  line-height: 1.65;
  color: var(--color-text);
  font-size: 0.95rem;
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
  padding: 0 6px;
}

.news-list-box h3 {
  margin: 0 0 12px 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: 0.02em;
}

.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.news-list li a {
  color: var(--text-muted);
  text-decoration: none;
  line-height: 1.45;
  display: block;
  transition: color 0.2s ease;
  font-size: 0.9rem;
}

.news-list li a:hover {
  color: var(--zen-blue-600, #035AA6);
}
</style>
