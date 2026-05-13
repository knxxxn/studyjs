<script setup>
import { ref, onMounted, watch } from 'vue'
import { userToken, handleAuthError } from '../store.js'
import { marked } from 'marked'

const scraps = ref([])
const isLoading = ref(false)
const errorMsg = ref('')

const showDeleteModal = ref(false)
const scrapToDelete = ref(null)

async function fetchScraps() {
  if (!userToken.value) return
  isLoading.value = true
  errorMsg.value = ''
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${baseUrl}/api/scraps`, {
      headers: { 'Authorization': `Bearer ${userToken.value}` }
    })
    if (handleAuthError(res)) return
    
    if (!res.ok) throw new Error('스크랩을 불러오는데 실패했습니다.')
    scraps.value = await res.json()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    isLoading.value = false
  }
}

function openDeleteModal(id) {
  scrapToDelete.value = id
  showDeleteModal.value = true
}

async function confirmDeleteScrap() {
  if (!scrapToDelete.value) return
  const id = scrapToDelete.value
  showDeleteModal.value = false
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${baseUrl}/api/scraps/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken.value}` }
    })
    if (handleAuthError(res)) return
    
    if (!res.ok) throw new Error('삭제 실패')
    scraps.value = scraps.value.filter(s => s.id !== id)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: '스크랩이 삭제되었습니다. 🗑️' }))
  } catch (err) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: err.message }))
  } finally {
    scrapToDelete.value = null
  }
}

onMounted(() => {
  fetchScraps()
})

watch(userToken, (newVal) => {
  if (newVal) fetchScraps()
  else scraps.value = []
})
</script>

<template>
  <div class="scrap-list-container">
    <div v-if="!userToken" class="auth-warning">
      🔒 로그인 후 스크랩 기능을 이용할 수 있습니다.
    </div>
    
    <div v-else-if="isLoading" class="loading-msg">
      ⏳ 스크랩을 불러오는 중...
    </div>
    
    <div v-else-if="errorMsg" class="error-msg">
      ⚠️ {{ errorMsg }}
    </div>
    
    <div v-else-if="scraps.length === 0" class="empty-msg">
      스크랩한 뉴스가 없습니다. 맘에 드는 뉴스를 스크랩해보세요!
    </div>
    
    <div v-else class="scraps-grid">
      <div v-for="scrap in scraps" :key="scrap.id" class="scrap-card">
        <div class="scrap-header">
          <a :href="scrap.link" target="_blank" rel="noopener noreferrer" class="scrap-title">{{ scrap.title }}</a>
          <button class="delete-btn" @click="openDeleteModal(scrap.id)" title="삭제">🗑️</button>
        </div>
        <div class="scrap-date">{{ new Date(scrap.created_at).toLocaleString() }}</div>
        <div v-if="scrap.memo" class="scrap-memo">
          <strong>📝 메모:</strong> {{ scrap.memo }}
        </div>
      </div>
    </div>
    
    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-content">
          <h3 class="modal-title">스크랩 삭제</h3>
          <p class="modal-desc">정말 이 스크랩을 삭제하시겠습니까?</p>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showDeleteModal = false">취소</button>
            <button type="button" class="btn-delete" @click="confirmDeleteScrap">확인</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.scrap-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 10px;
}

.auth-warning, .empty-msg, .loading-msg {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  background: var(--item-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--panel-border);
}

.error-msg {
  padding: 12px 16px;
  background: rgba(179, 122, 212, 0.1);
  color: var(--zen-verbena, #B37AD4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(179, 122, 212, 0.25);
  font-size: 0.9rem;
}

.scraps-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scrap-card {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: all 0.2s ease;
}

.scrap-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: rgba(3, 90, 166, 0.2);
}

.scrap-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.scrap-title {
  font-weight: 700;
  color: var(--color-heading);
  text-decoration: none;
  font-size: 1.05rem;
  line-height: 1.4;
}

.scrap-title:hover {
  color: var(--zen-blue-600, #035AA6);
  text-decoration: underline;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.scrap-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.scrap-memo {
  background: var(--input-bg);
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.5;
  border: 1px solid var(--input-border);
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

.modal-content {
  background: var(--color-background);
  color: var(--color-text);
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

[data-theme="dark"] .modal-content {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-title {
  margin: 0 0 12px 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
}

.modal-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 11px 0;
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

.btn-delete {
  flex: 1;
  padding: 11px 0;
  border-radius: var(--radius-pill);
  border: none;
  background: #dc2626;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #b91c1c;
}
</style>
