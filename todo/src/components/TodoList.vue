<script setup>
import { computed, ref } from 'vue'
import { selectedDateStr, todosByDate, memosByDate } from '../store.js'

const todoInput = ref('')

const dateMemo = computed({
  get() {
    return memosByDate.value[selectedDateStr.value] || ''
  },
  set(val) {
    memosByDate.value[selectedDateStr.value] = val
  }
})

// "항상 미완료 보여주기": 모든 날짜의 미완료 항목을 상단에 모으고, 
// 완료된 항목은 현재 선택된 날짜의 항목만 하단에 표시합니다.
const sortedTodos = computed(() => {
  const allIncomplete = []
  const sortedDates = Object.keys(todosByDate.value).sort()
  for (const date of sortedDates) {
    todosByDate.value[date].forEach(t => {
      if (!t.done) {
        allIncomplete.push({ ...t, _dateKey: date })
      }
    })
  }

  const currentComplete = (todosByDate.value[selectedDateStr.value] || [])
    .filter(t => t.done)
    .map(t => ({ ...t, _dateKey: selectedDateStr.value }))

  return [...allIncomplete, ...currentComplete]
})

const remainingCount = computed(() => sortedTodos.value.filter(t => !t.done).length)

function addTodo() {
  const trimmed = todoInput.value.trim()
  if (!trimmed) return
  if (!todosByDate.value[selectedDateStr.value]) {
    todosByDate.value[selectedDateStr.value] = []
  }
  todosByDate.value[selectedDateStr.value].unshift({
    id: Date.now(),
    text: trimmed,
    done: false,
  })
  todoInput.value = ''
}

function toggleTodo(todo) {
  const list = todosByDate.value[todo._dateKey]
  const target = list.find((item) => item.id === todo.id)
  if (target) {
    target.done = !target.done
    // 미완료 -> 완료: 현재 선택된 날짜로 이동
    if (target.done && todo._dateKey !== selectedDateStr.value) {
      removeTodo(todo)
      if (!todosByDate.value[selectedDateStr.value]) {
        todosByDate.value[selectedDateStr.value] = []
      }
      todosByDate.value[selectedDateStr.value].unshift(target)
    }
  }
}

function removeTodo(todo) {
  const list = todosByDate.value[todo._dateKey]
  todosByDate.value[todo._dateKey] = list.filter((t) => t.id !== todo.id)
}

function clearCompleted() {
  const list = todosByDate.value[selectedDateStr.value]
  if (list) {
    todosByDate.value[selectedDateStr.value] = list.filter((t) => !t.done)
  }
}

// ── 순서 이동 (버튼) ──
function moveUp(index) {
  if (index === 0) return
  swapTodos(index, index - 1)
}

function moveDown(index) {
  if (index === sortedTodos.value.length - 1) return
  swapTodos(index, index + 1)
}

function swapTodos(idxA, idxB) {
  const tA = sortedTodos.value[idxA]
  const tB = sortedTodos.value[idxB]
  
  const listA = todosByDate.value[tA._dateKey]
  const listB = todosByDate.value[tB._dateKey]
  
  const realIdxA = listA.findIndex(t => t.id === tA.id)
  const realIdxB = listB.findIndex(t => t.id === tB.id)

  if (tA._dateKey === tB._dateKey) {
    const temp = listA[realIdxA]
    listA[realIdxA] = listB[realIdxB]
    listB[realIdxB] = temp
  } else {
    const tempA = listA.splice(realIdxA, 1)[0]
    const tempB = listB.splice(realIdxB, 1)[0]
    listA.splice(realIdxA, 0, tempB)
    listB.splice(realIdxB, 0, tempA)
  }
}

// ── 드래그 앤 드롭 ──
const dragSrcIndex = ref(null)
const dragOverIndex = ref(null)

function onDragStart(index) {
  dragSrcIndex.value = index
}

function onDragOver(index) {
  dragOverIndex.value = index
}

function onDrop(index) {
  if (dragSrcIndex.value === null || dragSrcIndex.value === index) {
    dragSrcIndex.value = null
    dragOverIndex.value = null
    return
  }
  
  const tSrc = sortedTodos.value[dragSrcIndex.value]
  const tTgt = sortedTodos.value[index]
  
  const listSrc = todosByDate.value[tSrc._dateKey]
  const listTgt = todosByDate.value[tTgt._dateKey]
  
  const realIdxSrc = listSrc.findIndex(t => t.id === tSrc.id)
  const realIdxTgt = listTgt.findIndex(t => t.id === tTgt.id)
  
  const [moved] = listSrc.splice(realIdxSrc, 1)
  listTgt.splice(realIdxTgt, 0, moved)
  
  dragSrcIndex.value = null
  dragOverIndex.value = null
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
        <p class="date-subtitle">{{ selectedDateStr }}</p>
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
        <div v-else></div>

        <button
          class="toggle-button"
          type="button"
          :style="{ color: todo.done ? '#16a34a' : '#1d4ed8' }"
          @click="toggleTodo(todo)"
        >
          {{ todo.done ? '이걸 해냄' : '해야 함' }}
        </button>

        <span class="todo-text">
          <span v-if="!todo.done && todo._dateKey !== selectedDateStr" class="todo-date-badge">{{ todo._dateKey }}</span>
          {{ todo.text }}
        </span>

        <button class="delete-button" type="button" @click="removeTodo(todo)">
          삭제
        </button>
      </li>
    </ul>

    <button class="clear-button" type="button" @click="clearCompleted">
      완료한 항목 지우기
    </button>

    <div class="memo-section">
      <h3 class="memo-title">오늘의 메모</h3>
      <textarea
        v-model="dateMemo"
        class="memo-input"
        placeholder="자잘자잘 주절주절"
      ></textarea>
    </div>
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

.date-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
  font-weight: 600;
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
  color: #0f172a;
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

.todo-text {
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-all;
}

.todo-date-badge {
  font-size: 0.65rem;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 6px;
  color: #475569;
  text-decoration: none !important;
}

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

.memo-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed #cbd5e1;
}

.memo-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 12px;
  margin-top: 0;
}

.memo-input {
  width: 100%;
  height: 120px;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font: inherit;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
}

.memo-input:focus {
  outline: 3px solid rgba(59, 130, 246, 0.18);
  border-color: #60a5fa;
  background: #fff;
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