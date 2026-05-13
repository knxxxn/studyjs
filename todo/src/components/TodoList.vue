<script setup>
import { computed, ref, nextTick } from 'vue'
import { selectedDateStr, todosByDate, memosByDate, getDDayText, globalDDay } from '../store.js'
import TodoItem from './TodoItem.vue'

// ── 커스텀 Confirm 모달 ──
const confirmState = ref(null) // { message, resolve }

function openConfirm(message) {
  return new Promise((resolve) => {
    confirmState.value = { message, resolve }
  })
}

function resolveConfirm(result) {
  confirmState.value?.resolve(result)
  confirmState.value = null
}

const todoInput = ref('')
const todoInputRef = ref(null)
const tags = ['일반', '업무', '공부']
const selectedTag = ref('일반')
const filterTag = ref('all')
const tagDropOpen = ref(false)

// 커스텀 드롭다운 토글 (외부 클릭 시 자동 닫힘)
function openTagDrop() {
  tagDropOpen.value = !tagDropOpen.value
  if (tagDropOpen.value) {
    const close = () => { tagDropOpen.value = false; document.removeEventListener('click', close) }
    setTimeout(() => document.addEventListener('click', close), 0)
  }
}

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
  
  nextTick(() => {
    todoInputRef.value?.focus()
  })
}

function toggleTodo(todo) {
  const list = todosByDate.value[todo._dateKey]
  const target = list.find((item) => item.id === todo.id)
  if (target) {
    target.done = !target.done
    showToast(target.done ? '클리어 🎉' : '응 다시해 🌀')
    
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
  if (!target) return

  const settingOn = !target.isDDay

  if (settingOn) {
    // 기존 D-Day 투두 모두 해제 (단일 D-Day 유지)
    for (const list of Object.values(todosByDate.value)) {
      for (const t of list) {
        if (t.isDDay) t.isDDay = false
      }
    }
    target.isDDay = true
    // globalDDay 연동: 투두 텍스트와 날짜로 설정
    globalDDay.value = { title: target.text, date: todo._dateKey }
    showToast('D-Day로 지정했습니다 🚩')
  } else {
    target.isDDay = false
    // 이 투두가 globalDDay와 연결된 경우 같이 해제
    if (globalDDay.value?.date === todo._dateKey && globalDDay.value?.title === target.text) {
      globalDDay.value = null
    }
    showToast('D-Day 지정을 해제했습니다.')
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
  const target = list.find(t => t.id === todo.id)
  // D-Day 투두 삭제 시 globalDDay도 해제
  if (target?.isDDay) {
    globalDDay.value = null
  }
  todosByDate.value[todo._dateKey] = list.filter((t) => t.id !== todo.id)
}

function removeTodo(todo) {
  removeTodoQuietly(todo)
  showToast('항목을 삭제했습니다 🗑️')
}

function clearCompleted() {
  const list = todosByDate.value[selectedDateStr.value]
  if (list) {
    const removingDDay = list.some(t => t.done && t.isDDay)
    const prevCount = list.filter(t => t.done).length
    todosByDate.value[selectedDateStr.value] = list.filter((t) => !t.done)
    if (removingDDay) globalDDay.value = null
    showToast(`완료된 ${prevCount}개의 항목을 지웠습니다 🧹`)
  }
}

// 캘린더에서 선택된 달(YYYY-MM)에 완료된 투두 일괄 삭제
const currentMonthPrefix = computed(() => {
  // selectedDateStr은 'YYYY-MM-DD' 형식이므로 앞 7자리만 사용
  return selectedDateStr.value.slice(0, 7) // e.g. '2026-03'
})

const thisMonthCompletedCount = computed(() => {
  let count = 0
  for (const [date, list] of Object.entries(todosByDate.value)) {
    if (date.startsWith(currentMonthPrefix.value)) {
      count += list.filter(t => t.done).length
    }
  }
  return count
})

async function clearThisMonthCompleted() {
  if (thisMonthCompletedCount.value === 0) {
    showToast('이번 달 완료된 항목이 없어요 ✨')
    return
  }
  const ok = await openConfirm(
    `완료된 투두 ${thisMonthCompletedCount.value}개를 삭제할까요?`
  )
  if (!ok) return

  let deleted = 0
  let removedDDay = false
  for (const date of Object.keys(todosByDate.value)) {
    if (date.startsWith(currentMonthPrefix.value)) {
      if (todosByDate.value[date].some(t => t.done && t.isDDay)) removedDDay = true
      const before = todosByDate.value[date].length
      todosByDate.value[date] = todosByDate.value[date].filter(t => !t.done)
      deleted += before - todosByDate.value[date].length
      // 날짜 키가 완전히 비었으면 제거해서 메모리 절약
      if (todosByDate.value[date].length === 0) {
        delete todosByDate.value[date]
      }
    }
  }
  if (removedDDay) globalDDay.value = null
  showToast(`이번 달 완료 항목 ${deleted}개를 정리했습니다 🧹`)
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
        <h1 class="gradient-text">TODO LIST</h1>
        <p class="date-subtitle">{{ selectedDateStr }}</p>
      </div>
      <span class="badge">남은 일 <strong style="font-size: 1.1rem; margin-left: 2px">{{ remainingCount }}</strong>개</span>
    </div>

    <!-- Filters -->
    <div class="filter-group">
      <button class="filter-chip" :class="{ active: filterTag === 'all' }" @click="filterTag = 'all'; selectedTag = '일반'">전체</button>
      <button 
        v-for="tag in tags" :key="tag" 
        class="filter-chip" 
        :class="{ active: filterTag === tag }" 
        @click="filterTag = tag; selectedTag = tag"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Input Form -->
    <form class="todo-form" @submit.prevent="addTodo">
      <!-- 커스텀 태그 셀렉터 -->
      <div class="tag-selector" @click.stop>
        <button type="button" class="tag-selector-btn" @click="openTagDrop">
          <span class="tag-dot" :class="`dot-${selectedTag}`"></span>
          {{ selectedTag }}
          <svg class="tag-chevron" :class="{ rotated: tagDropOpen }" viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
        <div v-if="tagDropOpen" class="tag-dropdown">
          <button v-for="tag in tags" :key="tag" type="button"
            class="tag-option" :class="{ active: selectedTag === tag }"
            @click="selectedTag = tag; tagDropOpen = false">
            <span class="tag-dot" :class="`dot-${tag}`"></span>
            {{ tag }}
          </button>
        </div>
      </div>
      <input 
        ref="todoInputRef"
        v-model="todoInput" 
        type="text" 
        placeholder="무슨 일을 할건가요?" 
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
      <div class="empty-icon">📅</div>
      <p>표시할 일정이 없네요!</p>
      <span>카테고리 태그와 함께 할 일을 추가해보세요</span>
      <button class="empty-action-btn" type="button" @click="todoInputRef?.focus()">
        할 일 등록하기 ⚡
      </button>
    </div>

    <button v-if="categorizedTodos.doneList.length > 0" class="clear-button btn-danger-outline" type="button" @click="clearCompleted">
      완료된 {{ categorizedTodos.doneList.length }}개 항목 지우기
    </button>

    <button
      v-if="thisMonthCompletedCount > 0"
      class="btn-old-clear"
      type="button"
      @click="clearThisMonthCompleted"
      :title="`${currentMonthPrefix} 완료 투두 ${thisMonthCompletedCount}개 삭제`"
    >
      🗂️ {{ currentMonthPrefix }} 완료 투두 {{ thisMonthCompletedCount }}개 정리하기
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

    <!-- 커스텀 Confirm 모달 -->
    <Transition name="modal-fade">
      <div v-if="confirmState" class="confirm-overlay" @click.self="resolveConfirm(false)">
        <div class="confirm-box">
          <div class="confirm-icon">🗂️</div>
          <p class="confirm-message">{{ confirmState.message }}</p>
          <p class="confirm-sub">삭제 후에는 복구할 수 없습니다.</p>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="resolveConfirm(false)">취소</button>
            <button class="confirm-ok" @click="resolveConfirm(true)">삭제</button>
          </div>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
/* ── Panel layout ── */
.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.gradient-text {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

/* ── Badge ── */
.badge {
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  background: rgba(109, 167, 242, 0.18);
  color: var(--zen-blue-600, #035AA6);
  font-size: 0.92rem;
  font-weight: 700;
  border: 1px solid rgba(109, 167, 242, 0.35);
  letter-spacing: 0.02em;
}

.date-subtitle {
  font-size: 0.92rem;
  color: var(--text-muted);
  margin-top: 4px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* ── Filters ── */
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.filter-chip {
  padding: 7px 18px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--input-border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.22s ease;
  line-height: 1.2;
  font-family: inherit;
}
.filter-chip:hover {
  background: var(--item-hover);
  color: var(--color-heading);
  border-color: var(--input-border);
}
.filter-chip.active {
  background: var(--zen-blue-600, #035AA6);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(3, 90, 166, 0.28);
}

/* ── Input Form ── */
.todo-form {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

input {
  flex: 1;
  padding: 13px 18px;
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 0.97rem;
  color: var(--color-heading);
  background: var(--input-bg);
  transition: all 0.22s ease;
}

input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.tag-select {
  padding: 13px 12px;
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-heading);
  background: var(--input-bg);
  transition: all 0.22s ease;
  cursor: pointer;
  outline: none;
}

.tag-select:focus, input:focus {
  border-color: var(--zen-blue-300, #6DA7F2);
  box-shadow: 0 0 0 3px rgba(109, 167, 242, 0.18);
  outline: none;
}

button {
  border: none;
  border-radius: var(--radius-md);
  font: inherit;
  cursor: pointer;
}

/* ── Primary button ── */
.btn-primary {
  padding: 13px 24px;
  font-size: 0.97rem;
  font-weight: 700;
  color: #fff;
  background: var(--zen-blue-600, #035AA6);
  box-shadow: 0 4px 14px rgba(3, 90, 166, 0.18);
  transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
  letter-spacing: 0.02em;
}
.btn-primary:hover {
  background: var(--zen-blue-900, #023373);
  box-shadow: 0 6px 18px rgba(3, 90, 166, 0.28);
}
.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(3, 90, 166, 0.14);
}

/* ── 커스텀 태그 셀렉터 ── */
.tag-selector {
  position: relative;
  flex-shrink: 0;
}

.tag-selector-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 14px;
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  color: var(--color-heading);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  min-width: 88px;
  transition: all 0.22s ease;
  white-space: nowrap;
}
.tag-selector-btn:hover {
  border-color: var(--zen-blue-300, #6DA7F2);
  background: var(--item-hover);
}

.tag-chevron {
  margin-left: auto;
  transition: transform 0.2s ease;
  opacity: 0.55;
}
.tag-chevron.rotated { transform: rotate(180deg); }

.tag-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  min-width: 100%;
  background: var(--panel-bg);
  border: 1.5px solid var(--panel-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px var(--shadow-color);
  z-index: 100;
  overflow: hidden;
  backdrop-filter: blur(16px);
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: none;
  border-radius: 0;
  transition: background 0.15s;
  text-align: left;
}
.tag-option:hover { background: var(--item-hover); }
.tag-option.active {
  background: rgba(109, 167, 242, 0.15);
  color: var(--zen-blue-600, #035AA6);
  font-weight: 700;
}

/* 태그 색상 점 */
.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.dot-일반 { background: var(--zen-blue-300, #6DA7F2); }
.dot-업무 { background: #023373; }
.dot-공부 { background: var(--zen-verbena, #B37AD4); }

/* ── Lists & Sections ── */
.lists-container {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin: 20px 0;
}

.section-title {
  font-size: 0.98rem;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.03em;
}

.overdue-title { color: var(--title-overdue); }
.today-title   { color: var(--title-today); }
.done-title    { color: var(--title-done); }

.todo-list {
  display: grid;
  gap: 9px;
  padding: 0;
  list-style: none;
}

/* ── Clear button ── */
.btn-danger-outline {
  width: 100%;
  padding: 13px;
  background: transparent;
  color: var(--text-muted);
  border: 1.5px dashed var(--input-border);
  font-weight: 600;
  font-size: 0.92rem;
  border-radius: var(--radius-md);
  transition: all 0.22s ease;
  margin-top: 10px;
}
.btn-danger-outline:hover {
  border-color: var(--zen-verbena, #B37AD4);
  color: var(--zen-verbena, #B37AD4);
  background: rgba(179, 122, 212, 0.06);
}

/* ── Old completed clear button ── */
.btn-old-clear {
  width: 100%;
  padding: 11px 13px;
  background: transparent;
  color: var(--text-muted);
  border: 1.5px dashed color-mix(in srgb, var(--input-border) 80%, transparent);
  font-weight: 600;
  font-size: 0.87rem;
  border-radius: var(--radius-md);
  transition: all 0.22s ease;
  margin-top: 8px;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0.8;
}
.btn-old-clear:hover {
  border-color: #e57373;
  color: #e57373;
  background: rgba(229, 115, 115, 0.06);
  opacity: 1;
}

/* ── Memo ── */
.memo-section {
  margin-top: auto;
  padding-top: 24px;
}

.memo-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 10px;
  margin-top: 0;
  letter-spacing: 0.02em;
}

.memo-input {
  width: 100%;
  height: 100px;
  padding: 14px 18px;
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 0.92rem;
  color: var(--color-heading);
  background: var(--memo-bg);
  resize: vertical;
  transition: all 0.22s ease;
  box-sizing: border-box;
}
.memo-input:focus {
  outline: none;
  border-color: var(--zen-blue-300, #6DA7F2);
  box-shadow: 0 0 0 3px rgba(109, 167, 242, 0.16);
  background: var(--input-bg);
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 52px 20px;
  margin: 28px 0;
  text-align: center;
  background: var(--item-bg);
  border: 2px dashed var(--panel-border);
  border-radius: var(--radius-xl);
}

.empty-icon {
  font-size: 3.2rem;
  margin-bottom: 14px;
  animation: floatIcon 3.5s ease-in-out infinite;
}

.empty-state p {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 8px 0;
}

.empty-state span {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.empty-action-btn {
  margin-top: 18px;
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--zen-blue-600, #035AA6);
  border: 1.5px solid var(--zen-blue-300, #6DA7F2);
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.22s ease;
}
.empty-action-btn:hover {
  background: rgba(109, 167, 242, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(3, 90, 166, 0.14);
}

@keyframes floatIcon {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-9px); }
  100% { transform: translateY(0); }
}

/* ── Toast ── */
.toast-notification {
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: var(--zen-blue-600, #035AA6);
  padding: 11px 26px;
  border-radius: var(--radius-pill);
  font-size: 0.92rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(3, 51, 115, 0.15);
  border: 1px solid rgba(109, 167, 242, 0.35);
  z-index: 1000;
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

@media (max-width: 640px) {
  .todo-form {
    flex-wrap: wrap;
  }
  .todo-form select {
    width: 100%;
  }
}

/* ── Confirm 모달 ── */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.confirm-box {
  background: var(--panel-bg);
  border: 1.5px solid var(--panel-border);
  border-radius: var(--radius-xl);
  padding: 32px 28px 24px;
  width: 90%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.confirm-icon {
  font-size: 2.4rem;
  margin-bottom: 4px;
}

.confirm-message {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0;
  line-height: 1.5;
}

.confirm-sub {
  font-size: 0.83rem;
  color: var(--text-muted);
  margin: 0 0 8px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
}

.confirm-cancel {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--input-border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}
.confirm-cancel:hover {
  background: var(--item-hover);
  color: var(--color-heading);
}

.confirm-ok {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-pill);
  border: none;
  background: #e57373;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(229, 115, 115, 0.28);
}
.confirm-ok:hover {
  background: #c62828;
  box-shadow: 0 6px 18px rgba(198, 40, 40, 0.32);
}

/* 모달 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.modal-fade-enter-active .confirm-box,
.modal-fade-leave-active .confirm-box {
  transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.22s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .confirm-box,
.modal-fade-leave-to .confirm-box {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}
</style>