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

      <div class="navigation-links" :class="{ 'active': isMenuOpen }">
        <router-link to="/" class="navigation-link">Home</router-link>
        <router-link to="/adopt" class="navigation-link">Adopt</router-link>
        <router-link to="/donate" class="navigation-link">Donate</router-link>
        <router-link to="/report" class="navigation-link">Report a Stray</router-link>
        <router-link to="/volunteer" class="navigation-link">Volunteer</router-link>
        
        <template v-if="isAdmin">
          <div class="dropdown-container">
            <button class="dropdown-toggle-button">
              Admin
              <span class="dropdown-arrow">▼</span>
            </button>
            <div class="dropdown-menu-container">
              <router-link to="/dashboard" class="dropdown-menu-item">Dashboard</router-link>
              <router-link to="/add" class="dropdown-menu-item">Add a Dog</router-link>
              <router-link to="/register" class="dropdown-menu-item">Register an Admin</router-link>
            </div>
          </div>
        </template>
      </div>

      <div class="authentication-buttons">
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="button-login-link">Login</router-link>
        </template>
        <template v-else>
          <button @click="handleLogout" class="button-logout-action">Logout</button>
        </template>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMenu">
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
  if (isMenuOpen.value && !event.target.closest('.navigation-links')) {
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

.navigation-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navigation-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s;
  position: relative;
}

.navigation-link:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #4CAF50;
  transition: width 0.2s;
}

.navigation-link:hover {
  color: #4CAF50;
}

.navigation-link:hover:after {
  width: 100%;
}

.dropdown-container {
  position: relative;
}

.dropdown-toggle-button {
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
  transition: color 0.2s;
}

.dropdown-toggle-button:hover {
  color: #4CAF50;
}

.dropdown-container:hover .dropdown-menu-container {
  display: block;
}

.dropdown-menu-container {
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

.dropdown-container:hover .dropdown-menu-container {
  opacity: 1;
  transform: translateY(0);
}

.dropdown-menu-item {
  display: block;
  padding: 0.8rem 1.2rem;
  text-decoration: none;
  color: #333;
  transition: all 0.2s;
  font-weight: 500;
}

.dropdown-menu-item:hover {
  background: #f5f5f5;
  color: #4CAF50;
  padding-left: 1.5rem;
}

.authentication-buttons {
  display: flex;
  gap: 1rem;
}

.button-login-link, .button-logout-action {
  padding: 0.6rem 1.8rem;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 1rem;
}

.button-login-link {
  background: #4CAF50;
  color: white;
  text-decoration: none;
}

.button-logout-action {
  background: #4CAF50;
  border: none;
  color: white;
}

.button-login-link:hover {
  background: #45a049;
}

.button-logout-action:hover {
  background: #45a049;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-toggle span {
  display: block;
  width: 25px;
  height: 2px;
  background: #333;
  transition: 0.2s;
}

@media (max-width: 968px) {
  .navigation-links {
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

  .navigation-links.active {
    display: flex;
  }

  .dropdown-container {
    width: 100%;
  }

  .dropdown-toggle-button {
    width: 100%;
    justify-content: center;
  }

  .dropdown-menu-container {
    position: static;
    box-shadow: none;
    margin-top: 0.5rem;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .authentication-buttons {
    margin-left: auto;
  }
}
</style>
