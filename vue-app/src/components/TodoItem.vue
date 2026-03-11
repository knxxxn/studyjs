<template>
  <li :style="{ textDecoration: todo.completed ? 'line-through' : 'none' }">
    {{ todo.text }}
    <!-- 삭제 및 완료 처리 이벤트 에밋 -->
    <button @click="$emit('toggle-todo', todo.id)">
      {{ todo.completed ? '되돌리기' : '완료' }}
    </button>
    <button @click="$emit('delete-todo', todo.id)">삭제</button>
  </li>
</template>

<script setup lang="ts">
import { Todo } from '../types'

defineProps<{
  todo: Todo
}>()

defineEmits<{
  (e: 'toggle-todo', id: number): void
  (e: 'delete-todo', id: number): void
}>()
</script>
