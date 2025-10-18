import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

import Home from './components/Home.vue'
import Adopt from './components/Adopt.vue'
import Report from './components/Report.vue'
import Donate from './components/Donate.vue'
import Dashboard from './components/Dashboard.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Add from './components/Add.vue'
import Volunteer from './components/Volunteer.vue'
import AdoptionForm from './components/AdoptionForm.vue'

// Navigation guards
function requireAdmin(to, from, next) {
  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
    return
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.role === 'admin') {
      next()
    } else {
      next('/')
    }
  } catch (e) {
    next('/login')
  }
}

const routes = [
  // Public routes
  { path: '/', component: Home },
  { path: '/home', component: Home },
  { path: '/adopt', component: Adopt },
  { path: '/adopt/:id', component: Adopt },
  { path: '/adopt/:id/apply', name: 'AdoptionForm', component: AdoptionForm },
  { path: '/about', component: Home },
  { path: '/report', component: Report },
  { path: '/donate', component: Donate },
  { path: '/volunteer', component: Volunteer },
  { path: '/login', component: Login },

  // Admin routes
  { 
    path: '/add', 
    component: Add,
    beforeEnter: requireAdmin
  },
  { 
    path: '/dashboard', 
    component: Dashboard,
    beforeEnter: requireAdmin
  },
  { 
    path: '/register', 
    component: Register,
    beforeEnter: requireAdmin
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

app.use(router)
app.mount('#app')