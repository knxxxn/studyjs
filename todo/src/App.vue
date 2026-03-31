<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import TodoList from './components/TodoList.vue'
import Weather from './components/Weather.vue'

const theme = ref(localStorage.getItem('user-theme') || 'system')

onMounted(() => {
  applyTheme(theme.value)
})

watchEffect(() => {
  applyTheme(theme.value)
  localStorage.setItem('user-theme', theme.value)
})

function applyTheme(newTheme) {
  if (newTheme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', newTheme)
  }
}

function toggleTheme() {
  const currentTheme = theme.value === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme.value

  theme.value = currentTheme === 'dark' ? 'light' : 'dark'
}

function setSystemTheme() {
  theme.value = 'system'
}
</script>

<template>
  <main class="app-shell">
    <div class="theme-controls">
      <button @click="toggleTheme" class="theme-btn" title="테마 전환">
        {{ theme === 'dark' ? '☀️ 라이트 모드로' : (theme === 'light' ? '🌙 다크 모드로' : '🌗 테마 변경') }}
      </button>
      <button v-if="theme !== 'system'" @click="setSystemTheme" class="theme-btn system-btn" title="시스템 설정 따르기">
        💻 시스템 설정
      </button>
    </div>
    <section class="card-grid">
      <TodoList />
      <Weather />
    </section>
  </main>
</template>

<style scoped>
.theme-controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.theme-btn {
  padding: 8px 16px;
  border-radius: 20px;
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
  width: min(1100px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 640px) {
  .hero {
    padding: 24px;
  }
}
</style>
