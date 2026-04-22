<script setup>
import { ref, watchEffect, onMounted, onUnmounted } from 'vue'
import TodoList from './components/TodoList.vue'
import Weather from './components/Weather.vue'
import NewsDashboard from './components/NewsDashboard.vue'

const theme = ref(localStorage.getItem('user-theme') || 'system')
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const currentView = ref('dashboard')
const isNavExpanded = ref(false)

function updateSystemTheme(e) {
  if (theme.value === 'system') {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
  }
}

onMounted(() => {
  mediaQuery.addEventListener('change', updateSystemTheme)
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', updateSystemTheme)
})

watchEffect(() => {
  if (theme.value === 'system') {
    document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme.value)
  }
  localStorage.setItem('user-theme', theme.value)
})

function toggleTheme() {
  const currentTheme = theme.value === 'system' 
    ? (mediaQuery.matches ? 'dark' : 'light')
    : theme.value

  theme.value = currentTheme === 'dark' ? 'light' : 'dark'
}

function setSystemTheme() {
  theme.value = 'system'
}
</script>

<template>
  <div class="layout-wrapper">
    <aside class="sidebar panel" :class="{ 'collapsed': !isNavExpanded }">
      <div class="brand">
        <button class="hamburger-btn" @click="isNavExpanded = !isNavExpanded" title="메뉴 토글">
          <svg v-if="!isNavExpanded" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h1 v-show="isNavExpanded">Dashboard</h1>
      </div>
      <nav class="nav-menu" v-show="isNavExpanded">
        <button 
          @click="currentView = 'dashboard'" 
          :class="{ active: currentView === 'dashboard' }"
          class="nav-btn"
        >
          ✅ 투두 대시보드
        </button>
        <button 
          @click="currentView = 'news'" 
          :class="{ active: currentView === 'news' }"
          class="nav-btn"
        >
          📰 오늘의 뉴스
        </button>
      </nav>
      <div class="sidebar-footer" v-show="isNavExpanded">
        <div class="theme-controls-vertical">
          <button @click="toggleTheme" class="theme-btn" title="테마 전환">
            {{ theme === 'dark' ? '☀️ 라이트 모드로' : (theme === 'light' ? '🌙 다크 모드로' : '🌗 테마 변경') }}
          </button>
          <button v-if="theme !== 'system'" @click="setSystemTheme" class="theme-btn system-btn" title="시스템 설정 따르기">
            💻 시스템 설정
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
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 24px;
  transition: width 0.3s ease, padding 0.3s ease;
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
  justify-content: center;
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
  gap: 24px;
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
    grid-template-columns: 1.4fr 1fr;
    height: 100%;
  }

  .news-grid {
    height: 100%;
  }
  
  :deep(.panel) {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
  }
}

@media (max-width: 640px) {
  .layout-wrapper {
    padding: 10px;
  }
  .sidebar {
    padding: 16px;
  }
}
</style>
