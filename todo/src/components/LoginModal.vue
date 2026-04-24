<script setup>
import { ref } from 'vue'
import { userToken, userName, fetchFromServer } from '../store.js'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'login-success'])

const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
let successTimer = null

function showSuccess(msg) {
  successMessage.value = msg
  if (successTimer) clearTimeout(successTimer)
  successTimer = setTimeout(() => { successMessage.value = '' }, 2500)
}

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const endpoint = isLoginMode.value ? '/api/auth/login' : '/api/auth/signup'
  
  const payload = {
    email: email.value,
    password: password.value
  }
  if (!isLoginMode.value) {
    payload.username = name.value
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.detail || '오류가 발생했습니다.')
    }
    
    if (isLoginMode.value) {
      // 로그인 성공
      userToken.value = data.access_token
      userName.value = data.user.username || data.user.email
      
      emit('login-success')
      // 서버에서 기존 데이터 불러오기
      fetchFromServer()
      closeModal()
      showSuccess(`환영합니다, ${data.user.username || data.user.email}님! 🎉`)
    } else {
      // 회원가입 성공 → 토스트 알림 + 로그인 화면 전환
      showSuccess('회원가입이 완료되었습니다! 로그인해 주세요 ✨')
      isLoginMode.value = true
      email.value = ''
      password.value = ''
      name.value = ''
      errorMessage.value = ''
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

function closeModal() {
  emit('close')
  // 초기화
  email.value = ''
  password.value = ''
  name.value = ''
  errorMessage.value = ''
  isLoginMode.value = true
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">✕</button>
      
      <h2 class="modal-title">{{ isLoginMode ? '로그인' : '회원가입' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="!isLoginMode" class="form-group">
          <label>이름 (Username)</label>
          <input type="text" v-model="name" required placeholder="이름을 입력하세요" />
        </div>
        
        <div class="form-group">
          <label>이메일</label>
          <input type="email" v-model="email" required placeholder="example@email.com" />
        </div>
        
        <div class="form-group">
          <label>비밀번호</label>
          <input type="password" v-model="password" required placeholder="비밀번호를 입력하세요" />
        </div>
        
        <div v-if="errorMessage" class="error-msg">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입') }}
        </button>
      </form>
      
      <div class="toggle-mode">
        <span v-if="isLoginMode">계정이 없으신가요? <a href="#" @click.prevent="isLoginMode = false">회원가입</a></span>
        <span v-else>이미 계정이 있으신가요? <a href="#" @click.prevent="isLoginMode = true">로그인</a></span>
      </div>
    </div>
  </div>

  <!-- Toast Notification (투두 알림 스타일) -->
  <Transition name="toast">
    <div v-if="successMessage" class="toast-notification">
      {{ successMessage }}
    </div>
  </Transition>
</template>

<style scoped>
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
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-background);
  color: var(--color-text);
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-title {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: var(--color-heading);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
}

.form-group input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 1rem;
}

.form-group input:focus {
  outline: 2px solid #6366f1;
  border-color: transparent;
}

.error-msg {
  color: #ef4444;
  font-size: 0.9rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.submit-btn {
  margin-top: 10px;
  padding: 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-mode {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.toggle-mode a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
}

.toggle-mode a:hover {
  text-decoration: underline;
}

/* Toast (TodoList 스타일과 동일) */
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
