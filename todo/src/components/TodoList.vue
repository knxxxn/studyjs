<script setup>
import { computed, ref } from 'vue'
import { selectedDateStr, todosByDate, memosByDate, getDDayText } from '../store.js'

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

// ── 인라인 편집 ──
const editingKey = ref(null)  // 'dateKey_id' 형태로 유일 식별
const editText = ref('')

function todoKey(todo) {
  return `${todo._dateKey}_${todo.id}`
}

function startEdit(todo) {
  if (todo.done) return
  editingKey.value = todoKey(todo)
  editText.value = todo.text
}

function commitEdit(todo) {
  const trimmed = editText.value.trim()
  if (trimmed) {
    // sortedTodos는 복사본이라 원본 store를 직접 수정
    const list = todosByDate.value[todo._dateKey]
    const target = list?.find((item) => item.id === todo.id)
    if (target) target.text = trimmed
  }
  editingKey.value = null
  editText.value = ''
}

function cancelEdit() {
  editingKey.value = null
  editText.value = ''
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

        <!-- 편집 중: input 표시 / 일반: 텍스트 표시 -->
        <span class="todo-text" v-if="editingKey !== todoKey(todo)" @dblclick="startEdit(todo)" :title="todo.done ? '' : '더블 클릭으로 편집'">
          <span v-if="!todo.done && todo._dateKey !== selectedDateStr" class="todo-date-badge">{{ todo._dateKey }}</span>
          <span v-if="todo.isDDay && !todo.done" class="todo-dday-badge" :title="todo._dateKey + ' 마감'">
            {{ getDDayText(todo._dateKey) }}
          </span>
          <span v-if="todo.tag && todo.tag !== '일반' && !todo.done" class="todo-tag-badge" :class="`tag-${todo.tag === '업무' ? 'work' : todo.tag === '개인' ? 'personal' : 'study'}`">
            {{ todo.tag }}
          </span>
          {{ todo.text }}
        </span>

        <input
          v-else
          class="todo-edit-input"
          v-model="editText"
          @blur="commitEdit(todo)"
          @keyup.enter="commitEdit(todo)"
          @keyup.esc="cancelEdit"
          :ref="el => { if (el) el.focus() }"
          @click.stop
        />

        <div class="action-buttons">
          <button
            v-if="!todo.done"
            class="edit-button"
            type="button"
            @click="startEdit(todo)"
            title="수정하기"
          >
            ✏️
          </button>
          <button
            v-if="!todo.done"
            class="flag-button"
            type="button"
            :class="{ active: todo.isDDay }"
            @click="toggleDDay(todo)"
            title="디데이 뱃지 토글"
          >
            🚩
          </button>
          <button class="delete-button" type="button" @click="removeTodo(todo)">
            삭제
          </button>
        </div>
      </li>
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

.todo-list li {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: var(--item-bg);
  color: var(--color-heading);
  transition: background 0.15s, opacity 0.15s, transform 0.15s;
}

.todo-list li.drag-over {
  background: #dbeafe;
  transform: scale(1.01);
}

.todo-list li.drag-src {
  opacity: 0.4;
}

.todo-text {
  cursor: text;
}

.todo-edit-input {
  width: 100%;
  padding: 6px 10px;
  border: 1.5px solid #60a5fa;
  border-radius: 10px;
  font: inherit;
  font-size: 0.95rem;
  color: var(--color-heading);
  background: var(--input-bg);
  outline: none;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
}

.todo-list li.done span {
  color: var(--text-muted);
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
  white-space: nowrap;
}

.todo-dday-badge {
  font-size: 0.75rem;
  background: #e0f2fe;
  color: #0284c7;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 800;
  white-space: nowrap;
}

.todo-tag-badge {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
}

.tag-work {
  background: #f59e0b; /* orange */
}
.tag-personal {
  background: #10b981; /* emerald */
}
.tag-study {
  background: #8b5cf6; /* violet */
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
  background: var(--btn-toggle-bg);
  color: var(--btn-toggle-text);
  font-size: 0.88rem;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.flag-button {
  padding: 8px;
  background: transparent;
  opacity: 0.4;
  font-size: 1rem;
  transition: all 0.2s;
  line-height: 1;
}

.flag-button:hover {
  background: #f1f5f9;
  opacity: 0.8;
}

.flag-button.active {
  opacity: 1;
  background: var(--btn-delete-bg);
  box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.3);
}

.edit-button {
  padding: 8px;
  background: transparent;
  font-size: 0.95rem;
  opacity: 0.6;
  transition: all 0.2s;
  line-height: 1;
}

.edit-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.delete-button {
  padding: 10px 12px;
  color: var(--btn-delete-text);
  background: var(--btn-delete-bg);
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

  .todo-list li {
    grid-template-columns: auto auto 1fr auto;
  }
}
</style>