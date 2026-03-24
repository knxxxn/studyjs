<script setup>
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'studyjs-todos'

const todoInput = ref('')
const todos = ref(loadTodos())
const dragSrcIndex = ref(null)
const dragOverIndex = ref(null)
const sortedTodos = computed(() => [ //다한건 아래로 정렬
  ...todos.value.filter(t => !t.done),
  ...todos.value.filter(t => t.done),
])

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return []
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
  if (!trimmed) return
  todos.value.unshift({
    id: Date.now(),
    text: trimmed,
    done: false,
  })
  todoInput.value = ''
}

function toggleTodo(id) {
  const todo = todos.value.find((item) => item.id === id)
  if (todo) todo.done = !todo.done
}

function removeTodo(id) {
  todos.value = todos.value.filter((todo) => todo.id !== id)
}

function clearCompleted() {
  todos.value = todos.value.filter((todo) => !todo.done)
}

// ── 순서 이동 (버튼) ──
function moveUp(index) {
  if (index === 0) return
  const arr = [...todos.value]
  const aId = sortedTodos.value[index].id
  const bId = sortedTodos.value[index - 1].id
  const aIdx = arr.findIndex(t => t.id === aId)
  const bIdx = arr.findIndex(t => t.id === bId)
  ;[arr[aIdx], arr[bIdx]] = [arr[bIdx], arr[aIdx]]
  todos.value = arr
}

function moveDown(index) {
  if (index === sortedTodos.value.length - 1) return
  const arr = [...todos.value]
  const aId = sortedTodos.value[index].id
  const bId = sortedTodos.value[index + 1].id
  const aIdx = arr.findIndex(t => t.id === aId)
  const bIdx = arr.findIndex(t => t.id === bId)
  ;[arr[aIdx], arr[bIdx]] = [arr[bIdx], arr[aIdx]]
  todos.value = arr
}

function onDrop(index) {
  if (dragSrcIndex.value === null || dragSrcIndex.value === index) {
    dragSrcIndex.value = null
    dragOverIndex.value = null
    return
  }
  const arr = [...todos.value]
  const srcId = sortedTodos.value[dragSrcIndex.value].id
  const tgtId = sortedTodos.value[index].id
  const srcIdx = arr.findIndex(t => t.id === srcId)
  const tgtIdx = arr.findIndex(t => t.id === tgtId)
  const [moved] = arr.splice(srcIdx, 1)
  arr.splice(tgtIdx, 0, moved)
  todos.value = arr
  dragSrcIndex.value = null
  dragOverIndex.value = null
}

// ── 드래그 앤 드롭 ──
function onDragStart(index) {
  dragSrcIndex.value = index
}

function onDragOver(index) {
  dragOverIndex.value = index
}

function onDragEnd() {
  dragSrcIndex.value = null
  dragOverIndex.value = null
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
      <input v-model="todoInput" type="text" placeholder="할 일 추가" />
      <button type="submit">추가</button>
    </form>

    <ul class="todo-list">
      <li
        v-for="(todo, index) in sortedTodos"
        :key="todo.id"
        :class="{
          done: todo.done,
          'drag-over': dragOverIndex === index,
          'drag-src': dragSrcIndex === index,
        }"
        :draggable="!todo.done"
        @dragstart="onDragStart(index)"
        @dragover.prevent="onDragOver(index)"
        @drop="onDrop(index)"
        @dragend="onDragEnd"
      >
        <!-- 드래그 핸들 + 위아래 버튼 -->
        <!-- done이 아닐 때만 순서 컨트롤 표시 -->
    <div class="order-controls" v-if="!todo.done">
      <span class="drag-handle" title="드래그로 이동">⠿</span>
      <div class="arrow-buttons">
        <button
          class="arrow-button"
          type="button"
          :disabled="index === 0"
          @click="moveUp(index)"
          title="위로"
        >▲</button>
        <button
          class="arrow-button"
          type="button"
          :disabled="index === sortedTodos.length - 1"
          @click="moveDown(index)"
          title="아래로"
        >▼</button>
      </div>
    </div>

        <!-- done이면 빈 div로 레이아웃 유지 -->
        <div v-else></div>

        <button
          class="toggle-button"
          type="button"
          :style="{ color: todo.done ? '#16a34a' : '#1d4ed8' }"
          @click="toggleTodo(todo.id)"
        >
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
  background: linear-gradient(135deg, #1d4ed8 55%, #0284c7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
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
  grid-template-columns: auto auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: #f8fafc;
  transition: background 0.15s, opacity 0.15s, transform 0.15s;
}

.todo-list li.drag-over {
  background: #dbeafe;
  transform: scale(1.01);
}

.todo-list li.drag-src {
  opacity: 0.4;
}

.todo-list li.done span {
  color: #64748b;
  text-decoration: line-through;
}

/* 순서 조작 컨트롤 */
.order-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.drag-handle {
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: grab;
  padding: 0 2px;
  user-select: none;
  line-height: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.arrow-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.arrow-button {
  padding: 2px 6px;
  font-size: 0.65rem;
  border-radius: 6px;
  background: #e2e8f0;
  color: #475569;
  line-height: 1;
  transition: background 0.1s;
}

.arrow-button:hover:not(:disabled) {
  background: #bfdbfe;
  color: #1d4ed8;
}

.arrow-button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.toggle-button {
  min-width: 78px;
  padding: 10px 12px;
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
  .todo-form {
    grid-template-columns: 1fr;
  }

  .todo-list li {
    grid-template-columns: auto auto 1fr auto;
  }
}
</style>