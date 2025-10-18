<!-- eslint-disable vue/singleline-html-element-content-newline, vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error -->
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
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
              class="form-input"
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
              class="form-input"
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
            class="auth-button"
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
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
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
  background: #f8f9fa;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.auth-header p {
  color: #666;
  margin: 0;
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
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 90%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.password-requirements {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.password-requirements ul {
  list-style: none;
  padding-left: 0;
  margin: 0.5rem 0;
}

.password-requirements li {
  margin: 0.25rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.password-requirements li::before {
  content: '✕';
  position: absolute;
  left: 0;
  color: #f44336;
}

.password-requirements li.met::before {
  content: '✓';
  color: #4CAF50;
}

.auth-button {
  width: 100%;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-button:hover {
  background: #45a049;
}

.auth-button:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.auth-footer a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top: 2px solid transparent;
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

  .auth-card {
    padding: 1.5rem;
  }
}
</style>