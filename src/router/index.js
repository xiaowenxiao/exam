import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Congratulation from '@/views/Congratulation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/congratulation',
    name: 'Congratulation',
    component: Congratulation
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
