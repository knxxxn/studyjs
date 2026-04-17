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
      type="button"
      :style="{ color: todo.done ? '#16a34a' : '#1d4ed8' }"
      @click="emit('toggle-done')"
    >
      {{ todo.done ? '✓ 이걸 해냄' : '○ 해야 함' }}
    </button>

    <span class="todo-text" v-if="!isEditing" @dblclick="startEdit" :title="todo.done ? '' : '더블 클릭으로 편집'">
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
  padding: 14px;
  border-radius: 18px;
  background: var(--item-bg);
  color: var(--color-heading);
  transition: background 0.15s, opacity 0.15s, transform 0.15s;
}

li.drag-over {
  background: #dbeafe;
  transform: scale(1.01);
}

li.drag-src {
  opacity: 0.4;
}

li.done span {
  color: var(--text-muted);
  text-decoration: line-through;
}

button {
  border: none;
  border-radius: 14px;
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

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 8px;
  transition: all 0.15s;
  line-height: 1;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.edit-button {
  color: #0284c7;
  background: #e0f2fe;
}
.edit-button:hover { background: #bae6fd; }

.flag-button {
  color: #d97706;
  background: #fef3c7;
}
.flag-button:hover { background: #fde68a; }

.flag-button.active {
  color: #b45309;
  background: #fcd34d;
  box-shadow: inset 0 0 0 1px #f59e0b;
}

.delete-button {
  color: var(--btn-delete-text);
  background: var(--btn-delete-bg);
}
.delete-button:hover {
  opacity: 0.8;
}

@media (max-width: 640px) {
  li {
    grid-template-columns: auto auto 1fr auto;
  }
}
</style>
