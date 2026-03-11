import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import Todo from '../pages/Todo.vue'

// React Router의 <Routes><Route path="..." element={...} /></Routes> 와 동일한 역할
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/todo',
    name: 'Todo',
    component: Todo
  }
]

const router = createRouter({
  // 브라우저의 HTML5 History API를 활용하는 방식 (예: /todo) -> React Router의 BrowserRouter와 같음
  history: createWebHistory(),
  routes
})

export default router
