<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline -->
<template>
  <div id="app">
    <Layout>
      <router-view />
    </Layout>
  </div>
</template>

<script setup>
import Layout from './ui/Layout.vue'
</script>

<style>
/* Global application styles */
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  padding-top: 70px;
  background-color: #f8f9fa;
}

/* Reset default margins for body and html */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* General container for centering content */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Default button styling */
.button {
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Primary action button style */
.button-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.button-primary:active {
  transform: translateY(0);
}

/* Secondary button style */
.button-secondary {
  background: #f0f0f0;
  color: #333;
  border: 2px solid #ddd;
}

.button-secondary:hover {
  background: #e0e0e0;
  border-color: #bbb;
}

/* Default form input styling */
.form-input-field {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
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
  opacity: 0.7;
}

/* Default card styling for content blocks */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: #2c3e50;
  margin-top: 0;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* Text colors */
p, span, div {
  color: #555;
}

/* Links */
a {
  color: #4CAF50;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: #45a049;
  text-decoration: underline;
}

/* Error and success messages */
.error-text {
  color: #c62828;
}

.success-text {
  color: #2e7d32;
}

.warning-text {
  color: #f57c00;
}
</style>