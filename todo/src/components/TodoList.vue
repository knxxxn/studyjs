<script setup>
import { computed, ref, nextTick } from 'vue'
import { selectedDateStr, todosByDate, memosByDate, getDDayText } from '../store.js'
import TodoItem from './TodoItem.vue'

const todoInput = ref('')
const todoInputRef = ref(null)
const tags = ['일반', '업무', '공부']
const selectedTag = ref('일반')
const filterTag = ref('all')

// Toast system
const toastMsg = ref('')
let toastTimer = null
function showToast(msg) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2500)
}

const dateMemo = computed({
  get() {
    return memosByDate.value[selectedDateStr.value] || ''
  },
  set(val) {
    memosByDate.value[selectedDateStr.value] = val
  }
})

// Sectioned Todos
const categorizedTodos = computed(() => {
  const overdue = []
  const todayIncomplete = []
  const doneList = []
  
  const sortedDates = Object.keys(todosByDate.value).sort()
  for (const date of sortedDates) {
    todosByDate.value[date].forEach(t => {
      if (filterTag.value !== 'all' && t.tag !== filterTag.value) return;

      if (!t.done) {
        if (date < selectedDateStr.value) {
          overdue.push({ ...t, _dateKey: date })
        } else if (date === selectedDateStr.value || t.isDDay) {
          todayIncomplete.push({ ...t, _dateKey: date })
        }
      } else if (date === selectedDateStr.value) {
        doneList.push({ ...t, _dateKey: selectedDateStr.value })
      }
    })
  }

  return { overdue, todayIncomplete, doneList }
})

const remainingCount = computed(() => {
  return categorizedTodos.value.overdue.length + categorizedTodos.value.todayIncomplete.length
})

const isListEmpty = computed(() => {
  return remainingCount.value === 0 && categorizedTodos.value.doneList.length === 0
})

function addTodo() {
  const trimmed = todoInput.value.trim()
  if (!trimmed) {
    showToast('할 일 내용을 입력해주세요 🥲')
    return
  }
  if (!todosByDate.value[selectedDateStr.value]) {
    todosByDate.value[selectedDateStr.value] = []
  }
  todosByDate.value[selectedDateStr.value].unshift({
    id: Date.now(),
    text: trimmed,
    done: false,
    tag: selectedTag.value,
    isDDay: false
  })
  
  showToast('항목이 추가되었습니다 ✨')
  todoInput.value = ''
  selectedTag.value = '일반'
  
  nextTick(() => {
    todoInputRef.value?.focus()
  })
}

function toggleTodo(todo) {
  const list = todosByDate.value[todo._dateKey]
  const target = list.find((item) => item.id === todo.id)
  if (target) {
    target.done = !target.done
    showToast(target.done ? '할 일을 완료했습니다 🎉' : '완료를 취소했습니다 롤백~')
    
    // 미완료 -> 완료: 현재 선택된 날짜로 옮기기
    if (target.done && todo._dateKey !== selectedDateStr.value) {
      removeTodoQuietly(todo)
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
    showToast(target.isDDay ? 'D-Day로 지정했습니다 🚩' : 'D-Day 지정을 해제했습니다.')
  }
}

function updateTodoText(todo, newText) {
  const list = todosByDate.value[todo._dateKey]
  const target = list?.find((item) => item.id === todo.id)
  if (target) {
    target.text = newText
    showToast('내용이 수정되었습니다 ✏️')
  }
}

function removeTodoQuietly(todo) {
  const list = todosByDate.value[todo._dateKey]
  todosByDate.value[todo._dateKey] = list.filter((t) => t.id !== todo.id)
}

function removeTodo(todo) {
  removeTodoQuietly(todo)
  showToast('항목을 삭제했습니다 🗑️')
}

function clearCompleted() {
  const list = todosByDate.value[selectedDateStr.value]
  if (list) {
    const prevCount = list.filter(t => t.done).length
    todosByDate.value[selectedDateStr.value] = list.filter((t) => !t.done)
    showToast(`완료된 ${prevCount}개의 항목을 지웠습니다 🧹`)
  }
}

// ── 순서 이동 로직 ──
function moveUp(todo) {
  const list = todosByDate.value[todo._dateKey]
  const realIdx = list.findIndex(t => t.id === todo.id)
  if (realIdx > 0) {
    const temp = list[realIdx]
    list[realIdx] = list[realIdx - 1]
    list[realIdx - 1] = temp
  }
}

function moveDown(todo) {
  const list = todosByDate.value[todo._dateKey]
  const realIdx = list.findIndex(t => t.id === todo.id)
  if (realIdx > -1 && realIdx < list.length - 1) {
    const temp = list[realIdx]
    list[realIdx] = list[realIdx + 1]
    list[realIdx + 1] = temp
  }
}

// ── 드래그 앤 드롭 ──
const dragSrcItem = ref(null)
const dragOverItem = ref(null)

function onDragStart(todo) {
  dragSrcItem.value = todo
}

function onDragOver(todo) {
  dragOverItem.value = todo
}

function onDrop(targetTodo) {
  if (!dragSrcItem.value || dragSrcItem.value.id === targetTodo.id) {
    clearDragState()
    return
  }
  
  if (dragSrcItem.value._dateKey !== targetTodo._dateKey) {
    showToast('다른 날짜 영역으로는 드래그할 수 없습니다 ✋')
    clearDragState()
    return
  }
  
  const list = todosByDate.value[targetTodo._dateKey]
  const srcIdx = list.findIndex(t => t.id === dragSrcItem.value.id)
  const tgtIdx = list.findIndex(t => t.id === targetTodo.id)
  
  const [moved] = list.splice(srcIdx, 1)
  list.splice(tgtIdx, 0, moved)
  
  clearDragState()
}

function clearDragState() {
  dragSrcItem.value = null
  dragOverItem.value = null
}
</script>

<template>
  <article class="panel scrollable-panel">
    <div class="panel-header">
      <div>
        <h1 class="gradient-text">Todo List</h1>
        <p class="date-subtitle">{{ selectedDateStr }}</p>
      </div>
      <span class="badge">남은 일 <strong style="font-size: 1.1rem; margin-left: 2px">{{ remainingCount }}</strong>개</span>
    </div>

    <!-- Filters -->
    <div class="filter-group">
      <button class="filter-chip" :class="{ active: filterTag === 'all' }" @click="filterTag = 'all'">전체</button>
      <button 
        v-for="tag in tags" :key="tag" 
        class="filter-chip" 
        :class="{ active: filterTag === tag }" 
        @click="filterTag = tag"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Input Form -->
    <form class="todo-form" @submit.prevent="addTodo">
      <select v-model="selectedTag" class="tag-select" title="카테고리 선택">
        <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
      </select>
      <input 
        ref="todoInputRef"
        v-model="todoInput" 
        type="text" 
        placeholder="어떤 일을 완료해야 하나요?" 
      />
      <button class="btn-primary" type="submit">추가</button>
    </form>

    <div class="lists-container" v-if="!isListEmpty">
      <!-- Section: Overdue -->
      <section class="todo-section" v-if="categorizedTodos.overdue.length > 0">
        <h3 class="section-title overdue-title">⚠️ 밀린 할 일</h3>
        <ul class="todo-list">
          <TodoItem
            v-for="(todo, index) in categorizedTodos.overdue"
            :key="todo.id"
            :todo="todo"
            :index="index"
            :selectedDateStr="selectedDateStr"
            :dragOverIndex="dragOverItem?.id === todo.id ? index : null"
            :dragSrcIndex="dragSrcItem?.id === todo.id ? index : null"
            :sortedTodosLength="categorizedTodos.overdue.length"
            @toggle-done="toggleTodo(todo)"
            @toggle-dday="toggleDDay(todo)"
            @update-text="val => updateTodoText(todo, val)"
            @remove="removeTodo(todo)"
            @move-up="moveUp(todo)"
            @move-down="moveDown(todo)"
            @dragstart="onDragStart(todo)"
            @dragover="onDragOver(todo)"
            @drop="onDrop(todo)"
            @dragend="clearDragState"
          />
        </ul>
      </section>

      <!-- Section: Today -->
      <section class="todo-section" v-if="categorizedTodos.todayIncomplete.length > 0">
        <h3 class="section-title today-title">✨ 오늘 할 일</h3>
        <ul class="todo-list">
          <TodoItem
            v-for="(todo, index) in categorizedTodos.todayIncomplete"
            :key="todo.id"
            :todo="todo"
            :index="index"
            :selectedDateStr="selectedDateStr"
            :dragOverIndex="dragOverItem?.id === todo.id ? index : null"
            :dragSrcIndex="dragSrcItem?.id === todo.id ? index : null"
            :sortedTodosLength="categorizedTodos.todayIncomplete.length"
            @toggle-done="toggleTodo(todo)"
            @toggle-dday="toggleDDay(todo)"
            @update-text="val => updateTodoText(todo, val)"
            @remove="removeTodo(todo)"
            @move-up="moveUp(todo)"
            @move-down="moveDown(todo)"
            @dragstart="onDragStart(todo)"
            @dragover="onDragOver(todo)"
            @drop="onDrop(todo)"
            @dragend="clearDragState"
          />
        </ul>
      </section>

      <!-- Section: Done -->
      <section class="todo-section" v-if="categorizedTodos.doneList.length > 0">
        <h3 class="section-title done-title">✅ 완료됨</h3>
        <ul class="todo-list">
          <TodoItem
            v-for="(todo, index) in categorizedTodos.doneList"
            :key="todo.id"
            :todo="todo"
            :index="index"
            :selectedDateStr="selectedDateStr"
            :dragOverIndex="dragOverItem?.id === todo.id ? index : null"
            :dragSrcIndex="dragSrcItem?.id === todo.id ? index : null"
            :sortedTodosLength="categorizedTodos.doneList.length"
            @toggle-done="toggleTodo(todo)"
            @toggle-dday="toggleDDay(todo)"
            @update-text="val => updateTodoText(todo, val)"
            @remove="removeTodo(todo)"
            @move-up="moveUp(todo)"
            @move-down="moveDown(todo)"
            @dragstart="onDragStart(todo)"
            @dragover="onDragOver(todo)"
            @drop="onDrop(todo)"
            @dragend="clearDragState"
          />
        </ul>
      </section>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <div class="empty-icon">🌱</div>
      <p>표시할 일정이 없네요!</p>
      <span>카테고리 태그와 함께 첫 할 일을 추가해보세요.</span>
      <button class="empty-action-btn" type="button" @click="todoInputRef?.focus()">
        할 일 등록하기 ⚡
      </button>
    </div>

    <button v-if="categorizedTodos.doneList.length > 0" class="clear-button btn-danger-outline" type="button" @click="clearCompleted">
      완료된 {{ categorizedTodos.doneList.length }}개 항목 지우기
    </button>

    <div class="memo-section">
      <h3 class="memo-title">오늘의 메모</h3>
      <textarea
        v-model="dateMemo"
        class="memo-input"
        placeholder="자잘자잘 주절주절"
      ></textarea>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toastMsg" class="toast-notification">
        {{ toastMsg }}
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--panel-border);
  border-radius: 24px;
  background: var(--panel-bg);
  box-shadow: 0 10px 40px var(--shadow-color);
  color: var(--color-text);
}

/* DeskTop Height Control handled in App.vue */
.scrollable-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.gradient-text {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 40%, #0284c7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  margin: 0;
  line-height: 1.1;
}

.badge {
  padding: 6px 14px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.15);
}

.date-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin-top: 4px;
  font-weight: 700;
}

/* Filters */
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.filter-chip {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--input-border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  line-height: 1.2;
}
.filter-chip:hover {
  background: var(--item-hover);
  color: var(--color-heading);
}
.filter-chip.active {
  background: #3b82f6;
  color: #fff;
  border-color: #2563eb;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
}

/* Input Form */
.todo-form {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

input {
  flex: 1;
  padding: 14px 16px;
  border: 1.5px solid var(--input-border);
  border-radius: 14px;
  font: inherit;
  font-size: 1rem;
  color: var(--color-heading);
  background: var(--input-bg);
  transition: all 0.2s;
}

input::placeholder {
  color: #94a3b8;
}

.tag-select {
  padding: 14px 12px;
  border: 1.5px solid var(--input-border);
  border-radius: 14px;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-heading);
  background: var(--input-bg);
  transition: all 0.2s;
  cursor: pointer;
  outline: none;
}

.tag-select:focus, input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

button {
  border: none;
  border-radius: 14px;
  font: inherit;
  cursor: pointer;
}

.btn-primary {
  padding: 14px 22px;
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transition: opacity 0.2s, transform 0.1s;
}
.btn-primary:hover {
  opacity: 0.9;
}
.btn-primary:active {
  transform: translateY(1px);
}

/* Lists & Sections */
.lists-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 20px 0;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.overdue-title { color: #dc2626; }
.today-title { color: #2563eb; }
.done-title { color: #64748b; }

.todo-list {
  display: grid;
  gap: 10px;
  padding: 0;
  list-style: none;
}

.btn-danger-outline {
  width: 100%;
  padding: 14px;
  background: transparent;
  color: var(--text-muted);
  border: 1.5px dashed var(--input-border);
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
  margin-top: 10px;
}

.btn-danger-outline:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.memo-section {
  margin-top: auto;
  padding-top: 24px;
}

.memo-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-heading);
  margin-bottom: 12px;
  margin-top: 0;
}

.memo-input {
  width: 100%;
  height: 100px;
  padding: 14px 16px;
  border: 1.5px solid var(--input-border);
  border-radius: 14px;
  font: inherit;
  font-size: 0.95rem;
  color: var(--color-heading);
  background: var(--memo-bg);
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
}

.memo-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background: var(--input-bg);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  margin: 30px 0;
  text-align: center;
  background: rgba(248, 250, 252, 0.5);
  border: 2px dashed var(--input-border);
  border-radius: 20px;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 14px;
  animation: floatIcon 3s ease-in-out infinite;
}

.empty-state p {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-heading);
  margin: 0 0 8px 0;
}

.empty-state span {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 600;
}

.empty-action-btn {
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 12px;
  background: var(--input-bg);
  color: #2563eb;
  border: 1.5px solid #2563eb;
  font-weight: 800;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.empty-action-btn:hover {
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

@keyframes floatIcon {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

/* Toast */
.toast-notification {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 100;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

@media (max-width: 640px) {
  .todo-form {
    flex-wrap: wrap;
  }
  .todo-form select {
    width: 100%;
  }
}
</style>