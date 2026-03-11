<template>
  <div>
    <h1>투두</h1>
    <TodoInput @add-todo="addTodo" />
    <TodoList 
      :todos="todos" 
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TodoInput from '../components/TodoInput.vue'
import TodoList from '../components/TodoList.vue'
import { Todo } from '../types'

const todos = ref<Todo[]>([])

const addTodo = (text: string) => {
  todos.value.push({ 
    id: Date.now(),
    text,
    completed: false
  })
}

const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id)
}
</script>
