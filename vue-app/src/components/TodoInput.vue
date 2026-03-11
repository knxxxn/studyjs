<template>
  <div>
    <input 
      type="text" 
      v-model="newTodoText" 
      placeholder="todo" 
    />
    <button @click="handleAdd">추가</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'add-todo', text: string): void
}>()

const newTodoText = ref('')

const handleAdd = () => {
  if (newTodoText.value.trim() !== '') {
    emit('add-todo', newTodoText.value.trim())
    newTodoText.value = ''
  }
}
</script>
