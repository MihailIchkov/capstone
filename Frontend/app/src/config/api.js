/**
 * Centralized API Configuration
 * Manages all backend API endpoints and base URLs
 * 
 * Usage: import { API_BASE_URL, API } from '@/config/api'
 * Example: fetch(`${API.ANIMALS}`)
 */

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000'
const API_UPLOADS = process.env.VUE_APP_UPLOADS_BASE_URL || `${API_BASE_URL}/uploads`

/**
 * API Endpoints
 * Centralized mapping of all backend API routes
 */
export const API = {
  // Animals endpoints
  ANIMALS: `${API_BASE_URL}/api/animals`,
  ANIMAL_BY_ID: (id) => `${API_BASE_URL}/api/animals/${id}`,
  ANIMAL_ADOPT: (id) => `${API_BASE_URL}/api/animals/${id}/adopt`,
  
  // Authentication endpoints
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Adoption endpoints
  ADOPTIONS: `${API_BASE_URL}/api/adoptions`,
  
  // Volunteer endpoints
  VOLUNTEERS: `${API_BASE_URL}/api/volunteers`,
  VOLUNTEER_STATUS: (id) => `${API_BASE_URL}/api/volunteers/${id}/status`,
  
  // Reports endpoints
  REPORTS: `${API_BASE_URL}/api/reports`,
  REPORT_STATUS: (id) => `${API_BASE_URL}/api/reports/${id}/status`,
  
  // PayPal endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_CAPTURE: (id) => `${API_BASE_URL}/api/orders/${id}/capture`,
  
  // Donations endpoints
  DONATIONS: `${API_BASE_URL}/api/donations`,
  
  // Dashboard endpoints
  DASHBOARD: `${API_BASE_URL}/api/dashboard`,
}

/**
 * Image URL helper
 * Converts relative image paths to full URLs
 * 
 * @param {string} imagePath - Relative image path (e.g., 'uploads/dog.jpg')
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `${API_UPLOADS}/${imagePath}`
}

/**
 * Fetch wrapper with centralized error handling
 * Simplifies API calls across the application
 * 
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<object>} Parsed response data
 * @throws {Error} API error details
 */
export const fetchAPI = async (url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }
  
  // Add auth token if available
  const token = localStorage.getItem('token')
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Error [${url}]:`, error)
    throw error
  }
}

export { API_BASE_URL, API_UPLOADS }
