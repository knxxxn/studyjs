<script setup>
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'studyjs-todos'

const todoInput = ref('')
const todos = ref(loadTodos())

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return [

    ]
  }

  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error('저장된 할 일 목록을 불러오지 못했습니다.', error)
    return []
  }
}

watch(
  todos,
  (newValue) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
  },
  { deep: true },
)

const remainingCount = computed(() => todos.value.filter((todo) => !todo.done).length)

function addTodo() {
  const trimmed = todoInput.value.trim()

  if (!trimmed) {
    return
  }

  todos.value.unshift({
    id: Date.now(),
    text: trimmed,
    done: false,
  })
  todoInput.value = ''
}

function toggleTodo(id) {
  const todo = todos.value.find((item) => item.id === id)

  if (todo) {
    todo.done = !todo.done
  }
}

function removeTodo(id) {
  todos.value = todos.value.filter((todo) => todo.id !== id)
}

function clearCompleted() {
  todos.value = todos.value.filter((todo) => !todo.done)
}
</script>

<template>
  <article class="panel">
    <div class="panel-header">
      <div>
        <p class="gradient-text">Todo List</p>
      </div>
      <span class="badge">남은 일 {{ remainingCount }}개</span>
    </div>

    <form class="todo-form" @submit.prevent="addTodo">
      <input
        v-model="todoInput"
        type="text"
        placeholder="할 일 추가"
      />
      <button type="submit">추가</button>
    </form>

    <ul class="todo-list">
      <li v-for="todo in todos" :key="todo.id" :class="{ done: todo.done }">
        <button class="toggle-button" type="button" @click="toggleTodo(todo.id); changeColor(todo.id) ":style="{ color: todo.done ? '#16a34a' : '#1d4ed8' }">
          {{ todo.done ? '이걸 해냄' : '해야 함' }}
        </button>
        <span>{{ todo.text }}</span>
        <button class="delete-button" type="button" @click="removeTodo(todo.id)">
          삭제
        </button>
      </li>
    </ul>

    <button class="clear-button" type="button" @click="clearCompleted">
      완료한 항목 지우기
    </button>
  </article>
</template>

<style scoped>
.panel {
  height: 100%;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.gradient-text {
  font-size: 2rem;
  font-weight: bold;
  /* 1. 그라데이션 배경 정의 */
  background:  linear-gradient(135deg, #1d4ed8 55%, #0284c7);
  
  /* 2. 배경을 글씨 모양으로 자름 */
  -webkit-background-clip: text;
  background-clip: text;
  
  /* 3. 실제 글자 색을 투명하게 설정 */
  -webkit-text-fill-color: transparent;
  
  /* 배경이 글자 밖으로 나오지 않게 처리 */
  display: inline-block;

  /* 텍스트를 대문자로 변환 */
  text-transform: uppercase;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.9rem;
  font-weight: 700;
}

.todo-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-top: 20px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font: inherit;
  color: #0f172a;
  background: #fff;
}

input:focus {
  outline: 3px solid rgba(59, 130, 246, 0.18);
  border-color: #60a5fa;
}

button {
  border: none;
  border-radius: 14px;
  font: inherit;
  cursor: pointer;
}

.todo-form button,
.clear-button {
  padding: 14px 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
}

.todo-list {
  display: grid;
  gap: 12px;
  margin: 20px 0;
  padding: 0;
  list-style: none;
}

.todo-list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: #f8fafc;
}

.todo-list li.done span {
  color: #64748b;
  text-decoration: line-through;
}

.toggle-button {
  min-width: 78px;
  padding: 10px 12px;
  color: #16a34a;
  background: #dbeafe;
  font-size: 0.88rem;
  font-weight: 700;
}

.delete-button {
  padding: 10px 12px;
  color: #dc2626;
  background: #fee2e2;
  font-weight: 700;
}

.clear-button {
  width: 100%;
}

@media (max-width: 640px) {
  .todo-form,
  .todo-list li {
    grid-template-columns: 1fr;
  }
}
</style>
