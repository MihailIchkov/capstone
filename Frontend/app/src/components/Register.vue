<!-- eslint-disable vue/singleline-html-element-content-newline, vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error -->
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="content-card">
        <div class="auth-header">
          <h2>Admin Registration</h2>
          <p>Create a new administrator account</p>
        </div>
        
        <form 
          class="auth-form"
          @submit.prevent="register"
        >
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              id="username"
              v-model="username" 
              type="text"
              required 
              :disabled="isLoading"
              class="form-input-field"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password"
              v-model="password" 
              type="password"
              required 
              :disabled="isLoading"
              class="form-input-field"
            >
            <div class="password-requirements">
              Password must contain:
              <ul>
                <li :class="{ met: password.length >= 8 }">At least 8 characters</li>
                <li :class="{ met: /[A-Z]/.test(password) }">One uppercase letter</li>
                <li :class="{ met: /[a-z]/.test(password) }">One lowercase letter</li>
                <li :class="{ met: /\d/.test(password) }">One number</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="email" 
              type="email"
              required 
              :disabled="isLoading"
              class="form-input-field"
              placeholder="admin@example.com"
            >
          </div>

          <div 
            v-if="error"
            class="error-message"
          >
            <i class="fas fa-exclamation-circle" />
            {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="button"
          >
            <span
              v-if="isLoading"
              class="loading-spinner"
            />
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const email = ref('')
const error = ref('')
const isLoading = ref(false)

function validatePassword(password) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)

  const errors = []
  if (password.length < minLength) errors.push(`at least ${minLength} characters`)
  if (!hasUpperCase) errors.push('one uppercase letter')
  if (!hasLowerCase) errors.push('one lowercase letter')
  if (!hasNumbers) errors.push('one number')

  return errors
}

const register = async () => {
  isLoading.value = true
  error.value = ''

  // Validate password
  const passwordErrors = validatePassword(password.value)
  if (passwordErrors.length > 0) {
    error.value = `Password must contain ${passwordErrors.join(', ')}`
    isLoading.value = false
    return
  }

  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Access token is missing')
    }

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        email: email.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    // Redirect to login page on success
    router.push('/login')
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 450px;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.auth-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.95rem;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input-field {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input-field:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-requirements {
  margin-top: 0.75rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #555;
}

.password-requirements ul {
  list-style: none;
  padding-left: 0;
  margin: 0.5rem 0 0 0;
}

.password-requirements li {
  margin: 0.4rem 0;
  padding-left: 1.8rem;
  position: relative;
  color: #e74c3c;
}

.password-requirements li::before {
  content: '✕';
  position: absolute;
  left: 0;
  color: #e74c3c;
  font-weight: bold;
}

.password-requirements li.met {
  color: #27ae60;
}

.password-requirements li.met::before {
  content: '✓';
  color: #27ae60;
}

.button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.button:active:not(:disabled) {
  transform: translateY(0);
}

.button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  background: #ffe6e6;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 4px solid #c62828;
  font-size: 0.95rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }

  .content-card {
    padding: 1.5rem;
  }

  .auth-header h2 {
    font-size: 1.5rem;
  }
}
</style>