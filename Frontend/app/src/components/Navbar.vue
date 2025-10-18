<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line, vue/attributes-order -->
<template>
  <header class="header">
    <nav class="navbar">
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/logo.png" alt="Stray Care Logo">
          <span>Stray Care</span>
        </router-link>
      </div>

      <div class="nav-links" :class="{ 'active': isMenuOpen }">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/adopt" class="nav-link">Adopt</router-link>
        <router-link to="/donate" class="nav-link">Donate</router-link>
        <router-link to="/report" class="nav-link">Report a Stray</router-link>
        <router-link to="/volunteer" class="nav-link">Volunteer</router-link>
        
        <template v-if="isAdmin">
          <div class="dropdown">
            <button class="dropdown-toggle">
              Admin
              <span class="arrow">▼</span>
            </button>
            <div class="dropdown-menu">
              <router-link to="/dashboard" class="dropdown-item">Dashboard</router-link>
              <router-link to="/add" class="dropdown-item">Add a Dog</router-link>
              <router-link to="/register" class="dropdown-item">Register an Admin</router-link>
            </div>
          </div>
        </template>
      </div>

      <div class="auth-buttons">
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="btn-login">Login</router-link>
        </template>
        <template v-else>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </template>
      </div>

      <button class="menu-toggle" @click="toggleMenu">
        <span />
        <span />
        <span />
      </button>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)
const isAdmin = ref(false)
const isMenuOpen = ref(false)

function checkAuthStatus() {
  const token = localStorage.getItem('token')
  if (!token) {
    isAuthenticated.value = false
    isAdmin.value = false
    return
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    isAuthenticated.value = true
    isAdmin.value = payload.role === 'admin'
  } catch (e) {
    localStorage.removeItem('token')
    isAuthenticated.value = false
    isAdmin.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  isAuthenticated.value = false
  isAdmin.value = false
  router.push('/login')
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Close menu when clicking outside
function handleClickOutside(event) {
  if (isMenuOpen.value && !event.target.closest('.nav-links')) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  checkAuthStatus()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => router.currentRoute.value, checkAuthStatus)
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo img {
  height: 100px;
  width: auto;
  margin-right: 1rem;
  object-fit: contain;
  background: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-link:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #4CAF50;
  transition: width 0.2s;
}

.nav-link:hover:after {
  width: 100%;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 0.5rem 0;
  min-width: 200px;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s, transform 0.3s;
  z-index: 1000;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 0.8rem 1.2rem;
  text-decoration: none;
  color: #333;
  transition: all 0.2s;
  font-weight: 500;
}

.dropdown-item:hover {
  background: #f5f5f5;
  color: #4CAF50;
  padding-left: 1.5rem;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn-login, .btn-logout {
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-login {
  background: #4CAF50;
  color: white;
  text-decoration: none;
}

.btn-logout {
  background: none;
  border: 2px solid #4CAF50;
  color: #4CAF50;
}

.btn-login:hover {
  background: #45a049;
}

.btn-logout:hover {
  background: #4CAF50;
  color: white;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-toggle span {
  display: block;
  width: 25px;
  height: 2px;
  background: #333;
  transition: 0.2s;
}

@media (max-width: 968px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .nav-links.active {
    display: flex;
  }

  .dropdown {
    width: 100%;
  }

  .dropdown-toggle {
    width: 100%;
    justify-content: center;
  }

  .dropdown-menu {
    position: static;
    box-shadow: none;
    margin-top: 0.5rem;
  }

  .menu-toggle {
    display: flex;
  }

  .auth-buttons {
    margin-left: auto;
  }
}
</style>