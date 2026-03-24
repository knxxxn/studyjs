<script setup>
import TodoList from './components/TodoList.vue'
import Weather from './components/Weather.vue'
</script>

<template>
  <main class="app-shell">
    <section class="card-grid">
      <TodoList />
      <Weather />
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  width: min(1100px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
}



.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 640px) {
  .hero {
    padding: 24px;
  }
}
</style>
