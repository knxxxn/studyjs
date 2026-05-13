<script setup>
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import { userToken, handleAuthError } from '../store.js'
import NewsScrapList from './NewsScrapList.vue'

const activeTab = ref('search') // 'search' or 'scraps'

const keyword = ref('')
const isLoading = ref(false)
const newsData = ref(null)
const errorMsg = ref('')

// Scrap Modal State
const showScrapModal = ref(false)
const scrapItem = ref(null)
const scrapMemo = ref('')
const isScraping = ref(false)

const memoInputRef = ref(null)

async function openScrapModal(news) {
  if (!userToken.value) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: '로그인 후 스크랩 기능을 이용할 수 있습니다. 🔐' }))
    return
  }
  scrapItem.value = news
  scrapMemo.value = ''
  showScrapModal.value = true
  nextTick(() => {
    memoInputRef.value?.focus()
  })
}

async function saveScrap() {
  if (!scrapItem.value) return
  isScraping.value = true
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${baseUrl}/api/scraps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.value}`
      },
      body: JSON.stringify({
        title: scrapItem.value.title,
        link: scrapItem.value.link,
        summary: '', // 요약은 전체 요약이므로 여기서는 제외하거나 필요시 추가
        memo: scrapMemo.value
      })
    })
    
    if (handleAuthError(res)) {
      showScrapModal.value = false
      return
    }
    
    if (!res.ok) throw new Error('스크랩 저장 실패')
    
    showScrapModal.value = false
    window.dispatchEvent(new CustomEvent('show-toast', { detail: '성공적으로 스크랩되었습니다! 🎉' }))
  } catch (err) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: err.message }))
  } finally {
    isScraping.value = false
  }
}


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
  let text = newsData.value.summary
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  return marked.parse(text, { breaks: true, gfm: true })
})
</script>

<template>
  <div class="panel news-panel">
    <header class="panel-header">
      <div class="title-group">
        <h1 class="gradient-text">TODAY NEWS</h1>
      </div>
      <p class="subtitle"> AI가 최신 뉴스를 요약해 드립니다</p> 
      
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'search' }" @click="activeTab = 'search'">📰 뉴스 검색</button>
        <button class="tab-btn" :class="{ active: activeTab === 'scraps' }" @click="activeTab = 'scraps'">📁 내 스크랩</button>
      </div>
    </header>
    
    <div v-if="activeTab === 'search'" class="tab-content">
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
              <div class="news-item-content">
                <a :href="news.link" target="_blank" rel="noopener noreferrer">{{ index + 1 }}. {{ news.title }}</a>
                <button class="btn-scrap" @click="openScrapModal(news)" title="이 뉴스 스크랩하기">📌 스크랩</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'scraps'" class="tab-content">
      <NewsScrapList />
    </div>

    <!-- Scrap Modal -->
    <Teleport to="body">
      <div v-if="showScrapModal" class="modal-overlay" @click.self="showScrapModal = false">
        <div class="modal-content scrap-modal">
        <h3 class="modal-title">📌 뉴스 스크랩</h3>
        <div class="scrap-info">
          <p class="scrap-news-title">{{ scrapItem?.title }}</p>
          <a :href="scrapItem?.link" target="_blank" class="scrap-news-link">{{ scrapItem?.link }}</a>
        </div>
        <textarea 
          ref="memoInputRef"
          v-model="scrapMemo" 
          class="scrap-memo-input" 
          placeholder="이 뉴스에 대한 메모를 남겨보세요... (선택사항)"
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="showScrapModal = false" :disabled="isScraping">취소</button>
          <button type="button" class="btn btn-primary" @click="saveScrap" :disabled="isScraping">
            {{ isScraping ? '저장중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
    </Teleport>
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

.tabs {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  border-bottom: 1px solid var(--panel-border);
  padding-bottom: 8px;
}

.tab-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-text);
  background: var(--item-bg);
}

.tab-btn.active {
  color: var(--zen-blue-600, #035AA6);
  border-bottom: 2px solid var(--zen-blue-600, #035AA6);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.news-item-content a {
  flex: 1;
}

.btn-scrap {
  background: rgba(3, 90, 166, 0.1);
  color: #035AA6;
  border: 1px solid rgba(3, 90, 166, 0.2);
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-scrap:hover {
  background: rgba(3, 90, 166, 0.2);
}

[data-theme="dark"] .btn-scrap {
  background: rgba(160, 196, 242, 0.15);
  color: #A0C4F2;
  border-color: rgba(160, 196, 242, 0.3);
}

[data-theme="dark"] .btn-scrap:hover {
  background: rgba(160, 196, 242, 0.25);
  color: #CEDEF2;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  backdrop-filter: blur(4px);
}

.modal-content.scrap-modal {
  background: var(--color-background);
  color: var(--color-text);
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

[data-theme="dark"] .modal-content.scrap-modal {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-heading);
}

.scrap-info {
  background: var(--item-bg);
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--panel-border);
}

.scrap-news-title {
  margin: 0 0 4px 0;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.4;
}

.scrap-news-link {
  font-size: 0.8rem;
  color: var(--text-muted);
  word-break: break-all;
  text-decoration: none;
}

.scrap-news-link:hover {
  text-decoration: underline;
}

.scrap-memo-input {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--input-border);
  background: var(--input-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}

.scrap-memo-input:focus {
  outline: none;
  border-color: var(--zen-blue-300, #6DA7F2);
  box-shadow: 0 0 0 3px rgba(109, 167, 242, 0.18);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel {
  padding: 10px 16px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: var(--color-background-soft);
}
</style>
