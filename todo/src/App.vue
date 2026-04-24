<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import TodoList from './components/TodoList.vue'
import Weather from './components/Weather.vue'
import NewsDashboard from './components/NewsDashboard.vue'
import LoginModal from './components/LoginModal.vue'
import { userToken, userName, fetchFromServer } from './store.js'

// 페이지 로드 시 이미 로그인되어 있으면 서버에서 데이터 불러오기
onMounted(() => {
  if (userToken.value) {
    fetchFromServer()
  }
})

const theme = ref(localStorage.getItem('user-theme') || 'light')

const currentView = ref('dashboard')
const isNavExpanded = ref(false)
const showLoginModal = ref(false)
const toastMsg = ref('')
let toastTimer = null

function showToast(msg) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2500)
}

function handleLogout() {
  userToken.value = null
  userName.value = ''
  showToast('로그아웃 되었습니다 👋')
}

async function handleDeleteAccount() {
  const confirmed = window.confirm(
    '정말로 회원 탈퇴하시겠습니까?\n\n모든 투두, 메모, 캘린더 데이터가 영구 삭제되며 복구할 수 없습니다.'
  )
  if (!confirmed) return

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${baseUrl}/api/auth/delete-account`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken.value}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || '탈퇴 처리 중 오류가 발생했습니다.')

    // 로컬 데이터 정리
    userToken.value = null
    userName.value = ''
    localStorage.removeItem('studyjs-todos')
    localStorage.removeItem('studyjs-memos')
    localStorage.removeItem('studyjs-global-dday')
    showToast('회원 탈퇴가 완료되었습니다.')
  } catch (err) {
    showToast(`탈퇴 실패: ${err.message}`)
  }
}

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('user-theme', theme.value)
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

function changeView(view) {
  currentView.value = view
  // 860px(모바일 및 태블릿 레이아웃) 이하에서는 메뉴 이동 시 사이드바를 닫기
  if (window.innerWidth <= 860) {
    isNavExpanded.value = false
  }
}
</script>

<template>
  <div class="layout-wrapper dashboard-unified">
    <aside class="sidebar panel" :class="{ 'collapsed': !isNavExpanded }">
      <div class="brand">
        <button class="hamburger-btn" @click="isNavExpanded = !isNavExpanded" title="메뉴 토글">
          <svg v-if="!isNavExpanded" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h1 v-show="isNavExpanded">메뉴</h1>
        <button v-show="!isNavExpanded" @click="toggleTheme" class="mobile-theme-btn" title="테마 전환">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
      <nav class="nav-menu" v-show="isNavExpanded">
        <button 
          @click="changeView('dashboard')" 
          :class="{ active: currentView === 'dashboard' }"
          class="nav-btn"
        >
          ✅ 투두 대시보드
        </button>
        <button 
          @click="changeView('news')" 
          :class="{ active: currentView === 'news' }"
          class="nav-btn"
        >
          📰 오늘의 뉴스
        </button>
      </nav>

      <div class="auth-section" v-show="isNavExpanded">
        <div v-if="userToken" class="user-info">
          <span class="greeting">👋 {{ userName || '사용자' }}님</span>
          <button @click="handleLogout" class="logout-btn">로그아웃</button>
          <button @click="handleDeleteAccount" class="delete-account-btn">회원 탈퇴</button>
        </div>
        <button v-else @click="showLoginModal = true" class="login-btn">
          🔐 로그인 / 회원가입
        </button>
      </div>
      <div class="sidebar-footer" v-show="isNavExpanded">
        <div class="theme-controls-vertical">
          <button @click="toggleTheme" class="theme-btn" title="테마 전환">
            {{ theme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드' }}
          </button>
        </div>
      </div>
    </aside>

    <main class="app-shell">
      <section v-if="currentView === 'dashboard'" class="card-grid">
        <TodoList />
        <Weather />
      </section>
      
      <section v-else-if="currentView === 'news'" class="news-grid">
        <NewsDashboard />
      </section>
    </main>

    <LoginModal 
      :show="showLoginModal" 
      @close="showLoginModal = false" 
    />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toastMsg" class="toast-notification">
        {{ toastMsg }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 24px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  padding: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.sidebar.collapsed .brand {
  margin-bottom: 0;
  justify-content: space-between;
}

.mobile-theme-btn {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-theme-btn:hover {
  background: var(--color-border);
}

.hamburger-btn {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.hamburger-btn:hover {
  background: var(--color-background-soft);
}

.brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.nav-btn {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
}

.nav-btn:hover {
  background: var(--color-background-soft);
}

.nav-btn.active {
  background: var(--color-background-soft);
  border-color: var(--color-border);
  color: #6366f1;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 24px;
}

.theme-controls-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.greeting {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
}

.logout-btn {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: var(--color-border);
}

.delete-account-btn {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted, #999);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-account-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.login-btn {
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #6366f1;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.login-btn:hover {
  background: #4f46e5;
}

.theme-btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.theme-btn:hover {
  background: var(--color-border);
}

.system-btn {
  background: var(--color-background-mute);
}

.app-shell {
  width: 100%;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.news-grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 860px) {
  .layout-wrapper {
    flex-direction: row;
    height: 100vh;
    padding: 20px;
    overflow: hidden;
  }
  
  .sidebar {
    width: 220px;
    height: calc(100vh - 40px);
    flex-shrink: 0;
  }

  .sidebar.collapsed {
    width: 72px;
  }
  
  .app-shell {
    flex: 1;
    height: calc(100vh - 40px);
    overflow: hidden;
  }
  
  .card-grid {
    display: grid !important;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) !important;
    width: 100%;
    height: 100%;
    gap: 0 !important;
  }

  .news-grid {
    height: 100%;
  }
}

@media (max-width: 640px) {
  .layout-wrapper {
    padding: 10px;
  }
  .sidebar {
    padding: 12px 16px;
    position: sticky;
    top: 10px;
    z-index: 100;
  }
  .sidebar.collapsed {
    width: max-content;
    margin: 0;
    border-radius: 999px;
  }
  .mobile-theme-btn {
    display: flex;
  }
}

@media (min-width: 641px) {
  .mobile-theme-btn {
    display: none;
  }
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #eff6ff;
  color: #2563eb;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
