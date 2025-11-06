<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line, vue/attributes-order -->
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="content-card">
        <div class="auth-header">
          <h2>Admin Login</h2>
          <p>Sign in to access the admin dashboard</p>
        </div>
        <form @submit.prevent="login" class="auth-form">
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
          </div>

          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle" />
            {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="button"
          >
            <span v-if="isLoading" class="loading-spinner" />
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
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

const login = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid admin credentials');
    }

    if (!data.token) {
      throw new Error('No token received from server');
    }

    // Decode and verify admin token
    try {
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      if (payload.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      // Store token only after verifying admin role
      localStorage.setItem('token', data.token);
      console.log('Admin login successful');
      router.push('/dashboard');
    } catch (e) {
      console.error('Token verification error:', e);
      throw new Error('Invalid admin access token');
    }

  } catch (err) {
    console.error('Login error:', err);
    error.value = err.message || 'Invalid admin credentials';
    localStorage.removeItem('token');
  } finally {
    isLoading.value = false;
  }
}
</script><style scoped>
.auth-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
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
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-input-field:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button {
  width: 100%;
  padding: 0.9rem 2rem;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 25px;
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
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
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