# API Configuration Migration Guide

## Overview

This guide explains how to use the centralized API configuration and migrate existing components from hardcoded URLs to the new system.

## Benefits

Single Source of Truth: All API endpoints defined in one file
Automatic Auth: JWT tokens automatically added to requests
Consistent Errors: Standardized error handling across app
Easy Migration: Change backend URL without touching components
Type Safety: Function based endpoints for parameters
Reduced Duplication: Eliminates 30 plus hardcoded URL strings

## Installation

The api.js configuration is already created at:
Frontend/app/src/config/api.js

No installation needed it is ready to use

## Usage Examples

### Basic API Call

Before (Old Way):
```javascript
const response = await fetch('http://localhost:5000/api/animals')
const data = await response.json()
```

After (New Way):
```javascript
import { fetchAPI, API } from '@/config/api'

const data = await fetchAPI(API.ANIMALS)
```

### API Call with Parameters

Before:
```javascript
const response = await fetch(`http://localhost:5000/api/animals/${id}`)
const animal = await response.json()
```

**After:**
```javascript
const animal = await fetchAPI(API.ANIMAL_BY_ID(id))
```

### API Call with Custom Options

**Before:**
```javascript
const response = await fetch('http://localhost:5000/api/animals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
})
const result = await response.json()
```

**After:**
```javascript
import { fetchAPI, API } from '@/config/api'

// Token automatically added!
const result = await fetchAPI(API.ANIMALS, {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### Image URLs

**Before:**
```javascript
const imageUrl = `http://localhost:5000/uploads/${imagePath}`
```

**After:**
```javascript
import { getImageUrl } from '@/config/api'

const imageUrl = getImageUrl(imagePath)
```

---

## Available API Endpoints

```javascript
// Animals
API.ANIMALS                    // GET all animals
API.ANIMAL_BY_ID(id)         // GET/PUT/DELETE specific animal
API.ANIMAL_ADOPT(id)         // POST adoption for animal

// Authentication
API.AUTH_LOGIN                // POST login
API.AUTH_REGISTER            // POST register

// Adoptions
API.ADOPTIONS                 // GET all adoptions

// Volunteers
API.VOLUNTEERS               // GET all volunteers
API.VOLUNTEER_STATUS(id)    // PUT update volunteer status

// Reports
API.REPORTS                  // GET all reports
API.REPORT_STATUS(id)       // PUT update report status

// PayPal
API.ORDERS                   // POST create order
API.ORDER_CAPTURE(id)       // POST capture order

// Donations
API.DONATIONS                // GET all donations

// Dashboard
API.DASHBOARD                // GET dashboard data
```

---

## Migration Checklist

When migrating a component, follow these steps:

### Step 1: Import API Config
```javascript
import { fetchAPI, API, getImageUrl } from '@/config/api'
```

### Step 2: Replace Fetch Calls
Replace all `fetch('http://localhost:5000/...')` with `fetchAPI(API.*)`

### Step 3: Remove Manual Headers
The `fetchAPI` wrapper automatically adds:
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (if logged in)

### Step 4: Replace Image URLs
Use `getImageUrl()` for all image paths

### Step 5: Test
Verify all API calls still work in browser console

---

## Error Handling

The `fetchAPI` wrapper provides consistent error handling:

```javascript
try {
  const data = await fetchAPI(API.ANIMALS)
  console.log('Success:', data)
} catch (error) {
  console.error('Error:', error.message)
  // Error is logged and details are available
}
```

All errors include:
- Endpoint URL
- HTTP status code (if applicable)
- Error message from server
- Console logging for debugging

---

## Environment Variable Configuration

### Frontend (.env)

```env
# Override base URLs if needed
VUE_APP_API_BASE_URL=http://localhost:5000
VUE_APP_UPLOADS_BASE_URL=http://localhost:5000/uploads
```

### For Production

```env
VUE_APP_API_BASE_URL=https://api.yourdomain.com
VUE_APP_UPLOADS_BASE_URL=https://cdn.yourdomain.com/uploads
```

---

## Component Migration Examples

### Example 1: Adopt.vue

**Before:**
```javascript
async function fetchDogs() {
  const res = await fetch('http://localhost:5000/api/animals')
  dogs.value = await res.json()
}
```

**After:**
```javascript
async function fetchDogs() {
  dogs.value = await fetchAPI(API.ANIMALS)
}
```

### Example 2: Dashboard.vue

**Before:**
```javascript
const response = await fetch(`http://localhost:5000/api/animals/${id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
})
```

**After:**
```javascript
await fetchAPI(API.ANIMAL_BY_ID(id), {
  method: 'PUT',
  body: JSON.stringify(formData)
})
```

### Example 3: Home.vue (Image URLs)

**Before:**
```javascript
function getImageUrl(imageUrl) {
  if (!imageUrl) return '/placeholder-dog.jpg'
  if (imageUrl.startsWith('http')) return imageUrl
  return `http://localhost:5000/uploads/${imageUrl}`
}
```

**After:**
```javascript
import { getImageUrl } from '@/config/api'
// Direct use - no need for wrapper function!
```

---

## Troubleshooting

### "API is not defined"
Make sure you imported it:
```javascript
import { API, fetchAPI } from '@/config/api'
```

### API calls still hitting wrong URL
Check your `.env` file - make sure `VUE_APP_API_BASE_URL` is set correctly

### Token not being sent
Token is automatically included if it exists in localStorage. Verify:
```javascript
console.log(localStorage.getItem('token'))
```

### CORS errors
This is a backend configuration issue, not related to this config file

---

## Best Practices

✅ **Do**
- Import API and fetchAPI from '@/config/api'
- Use API constant for all endpoints
- Keep image URLs using getImageUrl()
- Use fetchAPI for all API calls

❌ **Don't**
- Hardcode 'http://localhost:5000' in components
- Manually add Authorization header (let fetchAPI do it)
- Mix fetchAPI with native fetch calls
- Duplicate API endpoints in multiple files

---

## Questions?

Refer to `api.js` for inline documentation and JSDoc comments.

---

**Version**: 1.0  
**Last Updated**: November 3, 2025
