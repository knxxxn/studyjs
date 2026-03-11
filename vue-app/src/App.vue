<template>
  <div>
    <!-- React Router의 <Navigation /> 역할 -->
    <Navigation /> 

    <!-- React Router의 <Routes><Route .../></Routes> 역할 (페이지 컴포넌트가 마운트 될 위치) -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import Navigation from './components/Navigation.vue'
</script>

<!-- react에서 layout.js에서 네비게이션 한거고 vue에서는 Navigation.vue에서 네비게이션한거임 -->