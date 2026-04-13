<script setup>
import { computed, ref } from 'vue'
import { selectedDateStr, todosByDate, memosByDate, getDDayText } from '../store.js'
import TodoItem from './TodoItem.vue'

const todoInput = ref('')
const tags = ['일반', '업무', '개인', '학습']
const selectedTag = ref('일반')

const dateMemo = computed({
  get() {
    return memosByDate.value[selectedDateStr.value] || ''
  },
  set(val) {
    memosByDate.value[selectedDateStr.value] = val
  }
})

// "과거/현재 미완료 보여주기": 선택된 날짜 이전(과거) 및 당일의 미완료 항목을 상단에 모으고, 
// 완료된 항목은 현재 선택된 날짜의 항목만 하단에 표시 (미래라도 isDDay가 켜진 항목은 표시)
const sortedTodos = computed(() => {
  const allIncomplete = []
  const sortedDates = Object.keys(todosByDate.value).sort()
  for (const date of sortedDates) {
    todosByDate.value[date].forEach(t => {
      if (!t.done) {
        if (date <= selectedDateStr.value || t.isDDay) {
          allIncomplete.push({ ...t, _dateKey: date })
        }
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
    tag: selectedTag.value
  })
  todoInput.value = ''
  selectedTag.value = '일반'
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

function toggleDDay(todo) {
  const list = todosByDate.value[todo._dateKey]
  const target = list.find((item) => item.id === todo.id)
  if (target) {
    target.isDDay = !target.isDDay
  }
}

// ── 텍스트 업데이트 ──
function updateTodoText(todo, newText) {
  const list = todosByDate.value[todo._dateKey]
  const target = list?.find((item) => item.id === todo.id)
  if (target) target.text = newText
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
      <select v-model="selectedTag" class="tag-select" title="카테고리 선택">
        <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
      </select>
      <input v-model="todoInput" type="text" placeholder="할 일 추가" />
      <button type="submit">추가</button>
    </form>

    <ul class="todo-list" v-if="sortedTodos.length > 0">
      <TodoItem
        v-for="(todo, index) in sortedTodos"
        :key="todo.id"
        :todo="todo"
        :index="index"
        :selectedDateStr="selectedDateStr"
        :dragOverIndex="dragOverIndex"
        :dragSrcIndex="dragSrcIndex"
        :sortedTodosLength="sortedTodos.length"
        @toggle-done="toggleTodo(todo)"
        @toggle-dday="toggleDDay(todo)"
        @update-text="val => updateTodoText(todo, val)"
        @remove="removeTodo(todo)"
        @move-up="moveUp(index)"
        @move-down="moveDown(index)"
        @dragstart="onDragStart"
        @dragover="onDragOver"
        @drop="onDrop"
        @dragend="onDragEnd"
      />
    </ul>

    <div class="empty-state" v-else>
      <div class="empty-icon">✨</div>
      <p>오늘은 어떤 멋진 일정이 있나요?</p>
      <span>새로운 할 일을 추가해보세요!</span>
    </div>

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
  border: 1px solid var(--panel-border);
  border-radius: 24px;
  background: var(--panel-bg);
  box-shadow: 0 20px 45px var(--shadow-color);
  color: var(--color-text);
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
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  margin-top: 20px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--input-border);
  border-radius: 14px;
  font: inherit;
  color: var(--color-heading);
  background: var(--input-bg);
  transition: all 0.2s;
}

input::placeholder {
  color: var(--text-muted);
}

.tag-select {
  padding: 14px 12px;
  border: 1px solid var(--input-border);
  border-radius: 14px;
  font: inherit;
  font-weight: 600;
  color: var(--color-heading);
  background: var(--input-bg);
  transition: all 0.2s;
  cursor: pointer;
  outline: none;
}

.tag-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
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
  color: var(--color-heading);
  margin-bottom: 12px;
  margin-top: 0;
}

.memo-input {
  width: 100%;
  height: 120px;
  padding: 14px 16px;
  border: 1px solid var(--input-border);
  border-radius: 14px;
  font: inherit;
  font-size: 0.95rem;
  color: var(--color-text);
  background: var(--memo-bg);
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
}

.memo-input:focus {
  outline: 3px solid rgba(59, 130, 246, 0.18);
  border-color: #60a5fa;
  background: #fff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  margin: 20px 0;
  text-align: center;
  background: rgba(248, 250, 252, 0.5);
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  animation: floatIcon 3s ease-in-out infinite;
}

.empty-state p {
  font-size: 1.1rem;
  font-weight: 800;
  color: #334155;
  margin: 0 0 6px 0;
}

.empty-state span {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}

@keyframes floatIcon {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

@media (max-width: 640px) {
  .todo-form {
    grid-template-columns: 1fr;
  }
}
</style>