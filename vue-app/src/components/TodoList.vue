<template>
  <div>
    <ul>
      <TodoItem 
        v-for="todo in todos" 
        :key="todo.id"
        :todo="todo"
        @toggle-todo="(id) => $emit('toggle-todo', id)"
        @delete-todo="(id) => $emit('delete-todo', id)"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import TodoItem from './TodoItem.vue'
import { Todo } from '../types'

defineProps<{
  todos: Todo[]
}>()

defineEmits<{
  (e: 'toggle-todo', id: number): void
  (e: 'delete-todo', id: number): void
}>()
</script>
