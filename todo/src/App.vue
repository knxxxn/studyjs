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
  isNavExpanded.value = false
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
        <h1 v-show="isNavExpanded">MENU</h1>
        <button v-show="!isNavExpanded" @click="toggleTheme" class="mobile-theme-btn" title="테마 전환">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
      <nav class="nav-menu">
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

      <div class="auth-section">
        <div v-if="userToken" class="user-info">
          <span class="greeting">👋 {{ userName || '사용자' }}님</span>
          <button @click="handleLogout" class="logout-btn">로그아웃</button>
          <button @click="handleDeleteAccount" class="delete-account-btn">회원 탈퇴</button>
        </div>
        <button v-else @click="showLoginModal = true" class="login-btn">
          🔐 로그인 / 회원가입
        </button>
      </div>
      <div class="sidebar-footer">
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
  transition: width 0.32s cubic-bezier(0.4, 0, 0.2, 1), padding 0.32s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  padding: 16px;
}

/* ── 사이드바 콘텐츠 전환 트랜지션 ── */
/* 닫힐 때: 즉시 숨김 */
.nav-menu,
.auth-section,
.sidebar-footer {
  opacity: 1;
  pointer-events: auto;
  /* 열릴 때: width 애니(0.32s) 끝난 뒤 페이드인 */
  transition: opacity 0.2s ease 0.28s;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .nav-menu,
.sidebar.collapsed .auth-section,
.sidebar.collapsed .sidebar-footer {
  opacity: 0;
  pointer-events: none;
  /* 닫힐 때: 빠르게 숨기고 지연 없이 */
  transition: opacity 0.1s ease;
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

/* ── 메뉴 제목 ── */
.brand h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  color: #035AA6;
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: -0.3px;
}

/* ── 네비게이션 메뉴 ── */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-btn {
  padding: 11px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  background: transparent;
  color: #035AA6;
  font-size: 0.97rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: 0.01em;
}

.nav-btn:hover {
  background: rgba(3, 90, 166, 0.08);
  border-color: rgba(3, 90, 166, 0.18);
}

.nav-btn.active {
  background: rgba(3, 90, 166, 0.12);
  border-color: rgba(3, 90, 166, 0.3);
  color: #035AA6;
  font-weight: 800;
}

/* ── 사이드바 푸터 ── */
.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
}

.theme-controls-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── 인증 섹션 ── */
.auth-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  /* 애니메이션: 잠김 시 overflow 단갈 방지 */
  overflow: hidden;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(3, 90, 166, 0.06);
  border-radius: var(--radius-md);
  border: 1px solid rgba(3, 90, 166, 0.18);
}

.greeting {
  font-weight: 700;
  font-size: 0.92rem;
  color: #035AA6;
  font-family: 'Outfit', sans-serif;
}

.logout-btn {
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  border: 1.5px solid rgba(3, 90, 166, 0.3);
  background: transparent;
  color: #035AA6;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(3, 90, 166, 0.1);
}

.delete-account-btn {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-account-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* ── 로그인 버튼 ── */
.login-btn {
  padding: 11px 16px;
  border-radius: var(--radius-pill);
  border: none;
  background: #6DA7F2;
  color: white;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.22s;
  width: 100%;
  letter-spacing: 0.02em;
}

.login-btn:hover {
  background: #206ABC;
}

/* ── 테마 전환 버튼 ── */
.theme-btn {
  padding: 10px 16px;
  border-radius: var(--radius-pill);
  border: 1.5px solid rgba(3, 90, 166, 0.25);
  background: transparent;
  color: #035AA6;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.theme-btn:hover {
  background: rgba(3, 90, 166, 0.08);
  border-color: rgba(3, 90, 166, 0.4);
}

/* ── 다크모드: 사이드바 ── */
[data-theme="dark"] .brand h1,
[data-theme="dark"] .nav-btn,
[data-theme="dark"] .nav-btn.active,
[data-theme="dark"] .greeting,
[data-theme="dark"] .logout-btn,
[data-theme="dark"] .theme-btn {
  color: #A0C4F2;
}

[data-theme="dark"] .nav-btn:hover {
  background: rgba(160, 196, 242, 0.12);
  border-color: rgba(160, 196, 242, 0.28);
  color: #CEDEF2;
}

[data-theme="dark"] .nav-btn.active {
  background: rgba(160, 196, 242, 0.16);
  border-color: rgba(160, 196, 242, 0.35);
  color: #CEDEF2;
}

[data-theme="dark"] .logout-btn {
  border-color: rgba(160, 196, 242, 0.3);
}
[data-theme="dark"] .logout-btn:hover {
  background: rgba(160, 196, 242, 0.12);
  color: #CEDEF2;
}

[data-theme="dark"] .theme-btn {
  border-color: rgba(160, 196, 242, 0.25);
}
[data-theme="dark"] .theme-btn:hover {
  background: rgba(160, 196, 242, 0.1);
  border-color: rgba(160, 196, 242, 0.42);
  color: #CEDEF2;
}

[data-theme="dark"] .user-info {
  background: rgba(160, 196, 242, 0.06);
  border-color: rgba(160, 196, 242, 0.2);
}

[data-theme="dark"] .hamburger-btn {
  color: #A0C4F2;
}
[data-theme="dark"] .hamburger-btn:hover {
  background: rgba(160, 196, 242, 0.1);
}

/* 다크모드: 로그인 버튼 반투명으로 */
[data-theme="dark"] .login-btn {
  background: rgba(109, 167, 242, 0.18);
  color: #A0C4F2;
  border: 1.5px solid rgba(109, 167, 242, 0.35);
}
[data-theme="dark"] .login-btn:hover {
  background: rgba(109, 167, 242, 0.28);
  color: #CEDEF2;
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
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #035AA6;
  padding: 11px 26px;
  border-radius: var(--radius-pill);
  font-size: 0.92rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 8px 24px rgba(3, 51, 115, 0.15);
  border: 1px solid rgba(109, 167, 242, 0.35);
  z-index: 2000;
  white-space: nowrap;
  backdrop-filter: blur(12px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -18px);
}
</style>
