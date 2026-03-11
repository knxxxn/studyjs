import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router) // React Router의 <Router> 태그로 감싸는 것과 동일합니다.
app.mount('#app')
