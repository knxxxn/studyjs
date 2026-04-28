<script setup>
import { ref, nextTick } from 'vue'
import { getDDayText } from '../store.js'

const props = defineProps({
  todo: { type: Object, required: true },
  index: { type: Number, required: true },
  selectedDateStr: { type: String, required: true },
  dragOverIndex: { type: Number, default: null },
  dragSrcIndex: { type: Number, default: null },
  sortedTodosLength: { type: Number, required: true }
})

const emit = defineEmits([
  'toggle-done',
  'toggle-dday',
  'update-text',
  'remove',
  'move-up',
  'move-down',
  'dragstart',
  'dragover',
  'drop',
  'dragend'
])

const isEditing = ref(false)
const editText = ref('')
const editInputRef = ref(null)

function startEdit() {
  if (props.todo.done) return
  editText.value = props.todo.text
  isEditing.value = true
  nextTick(() => {
    editInputRef.value?.focus()
  })
}

function commitEdit() {
  if (editText.value.trim()) {
    emit('update-text', editText.value.trim())
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <li
    :class="{
      done: todo.done,
      'drag-over': dragOverIndex === index,
      'drag-src': dragSrcIndex === index,
    }"
    :draggable="!todo.done"
    @dragstart="emit('dragstart', index)"
    @dragover.prevent="emit('dragover', index)"
    @drop="emit('drop', index)"
    @dragend="emit('dragend')"
  >
    <div class="order-controls" v-if="!todo.done">
      <span class="drag-handle" title="드래그로 이동">⠿</span>
      <div class="arrow-buttons">
        <button
          class="arrow-button"
          type="button"
          :disabled="index === 0"
          @click="emit('move-up')"
          title="위로"
        >▲</button>
        <button
          class="arrow-button"
          type="button"
          :disabled="index === sortedTodosLength - 1"
          @click="emit('move-down')"
          title="아래로"
        >▼</button>
      </div>
    </div>
    <div v-else></div>

    <button
      class="toggle-button"
      :class="{ 'is-done': todo.done }"
      type="button"
      @click="emit('toggle-done')"
    >
      {{ todo.done ? '✓ 이걸 해냄' : '○ 해야 함' }}
    </button>

    <span class="todo-text" v-if="!isEditing" @dblclick="startEdit" :title="todo.done ? '' : '더블 클릭으로 편집'">
      <span v-if="!todo.done && todo._dateKey !== selectedDateStr" class="todo-date-badge">{{ todo._dateKey }}</span>
      <span v-if="todo.isDDay && !todo.done" class="todo-dday-badge" :title="todo._dateKey + ' 마감'">
        {{ getDDayText(todo._dateKey) }}
      </span>
      <span v-if="todo.tag && todo.tag !== '일반' && !todo.done" class="todo-tag-badge" :class="`tag-${todo.tag === '업무' ? 'work' : 'study'}`">
        {{ todo.tag }}
      </span>
      {{ todo.text }}
    </span>

    <input
      v-else
      class="todo-edit-input"
      v-model="editText"
      @blur="commitEdit"
      @keyup.enter="commitEdit"
      @keyup.esc="cancelEdit"
      ref="editInputRef"
      @click.stop
    />

    <div class="action-buttons">
      <button
        v-if="!todo.done"
        class="action-btn edit-button"
        type="button"
        @click="startEdit"
        title="수정하기"
      >
        ✏️ 수정
      </button>
      <button
        v-if="!todo.done"
        class="action-btn flag-button"
        type="button"
        :class="{ active: todo.isDDay }"
        @click="emit('toggle-dday')"
        title="디데이 추가/해제"
      >
        🚩 D-Day
      </button>
      <button class="action-btn delete-button" type="button" @click="emit('remove')">
        🗑️ 삭제
      </button>
    </div>
  </li>
</template>

<style scoped>
li {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
  border-radius: var(--radius-md);
  background: var(--item-bg);
  color: var(--color-heading);
  border: 1px solid transparent;
  transition: background 0.18s, opacity 0.18s, transform 0.18s, border-color 0.18s;
}

li:hover {
  border-color: var(--panel-border);
}

li.drag-over {
  background: rgba(109, 167, 242, 0.14);
  border-color: var(--zen-blue-300, #6DA7F2);
  transform: scale(1.01);
}

li.drag-src {
  opacity: 0.38;
}

li.done span {
  color: var(--text-muted);
  text-decoration: line-through;
}

button {
  border: none;
  border-radius: var(--radius-md);
  font: inherit;
  cursor: pointer;
}

.todo-text {
  cursor: text;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-all;
}

.todo-edit-input {
  width: 100%;
  padding: 6px 12px;
  border: 1.5px solid var(--zen-blue-300, #6DA7F2);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 0.95rem;
  color: var(--color-heading);
  background: var(--input-bg);
  outline: none;
  box-shadow: 0 0 0 3px rgba(109, 167, 242, 0.16);
}

/* ── Badges ── */
.todo-date-badge {
  font-size: 0.62rem;
  background: rgba(160, 196, 242, 0.2);
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  color: var(--zen-blue-600, #035AA6);
  text-decoration: none !important;
  white-space: nowrap;
  font-weight: 600;
  border: 1px solid rgba(160, 196, 242, 0.3);
}

.todo-dday-badge {
  font-size: 0.72rem;
  background: rgba(121, 151, 230, 0.18);
  color: var(--zen-atlantis, #206ABC);
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid rgba(121, 151, 230, 0.3);
}

.todo-tag-badge {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
}

.tag-work    { background: #023373; }
.tag-study   { background: #B37AD4; }

/* ── Order controls ── */
.order-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.drag-handle {
  font-size: 1.2rem;
  color: var(--drag-handle);
  cursor: grab;
  padding: 0 2px;
  user-select: none;
  line-height: 1;
}
.drag-handle:active { cursor: grabbing; }

.arrow-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.arrow-button {
  padding: 2px 6px;
  font-size: 0.6rem;
  border-radius: var(--radius-sm);
  background: var(--arrow-btn-bg);
  color: var(--arrow-btn-text);
  line-height: 1;
  transition: background 0.15s;
}
.arrow-button:hover:not(:disabled) {
  background: rgba(109, 167, 242, 0.25);
  color: var(--zen-blue-600, #035AA6);
}
.arrow-button:disabled {
  opacity: 0.22;
  cursor: not-allowed;
}

/* ── Toggle button ── */
.toggle-button {
  min-width: 78px;
  padding: 9px 12px;
  background: var(--btn-toggle-bg);
  color: var(--btn-toggle-text);
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--radius-pill);
  transition: all 0.22s ease;
}
.toggle-button.is-done {
  background: var(--btn-toggle-done-bg);
  color: var(--btn-toggle-done-text);
}

/* ── Action buttons ── */
.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: var(--radius-pill);
  transition: all 0.18s ease;
  line-height: 1;
  font-family: inherit;
}
.action-btn:hover {
  transform: translateY(-1px);
}

.edit-button {
  color: var(--zen-atlantis, #206ABC);
  background: rgba(32, 106, 188, 0.12);
}
.edit-button:hover { background: rgba(32, 106, 188, 0.22); }

.flag-button {
  color: #c07a00;
  background: rgba(234, 179, 8, 0.12);
}
.flag-button:hover { background: rgba(234, 179, 8, 0.22); }
.flag-button.active {
  color: #92400e;
  background: rgba(234, 179, 8, 0.3);
  box-shadow: inset 0 0 0 1px rgba(234, 179, 8, 0.5);
}

.delete-button {
  color: #e05252;
  background: rgba(220, 38, 38, 0.1);
}
.delete-button:hover {
  background: rgba(220, 38, 38, 0.18);
  opacity: 1;
}

/* 다크모드: 삭제 버튼 더 은은하게 */
:root[data-theme="dark"] .delete-button {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}
:root[data-theme="dark"] .delete-button:hover {
  background: rgba(239, 68, 68, 0.18);
}


@media (max-width: 640px) {
  li {
    grid-template-columns: auto auto 1fr;
    row-gap: 10px;
  }
  .action-buttons {
    grid-column: 1 / -1;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px dashed var(--input-border);
  }
}
</style>
