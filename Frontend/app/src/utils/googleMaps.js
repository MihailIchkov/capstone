/**
 * Google Maps API Loader
 * Loads Google Maps with standard API format
 * 
 * Features:
 * - Caches promise for reuse across components
 * - Proper error handling with recovery
 * 
 * Usage:
 * ```javascript
 * import { loadGoogleMapsAPI } from '@/utils/googleMaps.js'
 * const google = await loadGoogleMapsAPI(process.env.VUE_APP_GOOGLE_MAPS_API_KEY)
 * const { Map, Marker } = google.maps
 * ```
 */

let googlePromise = null

/**
 * Loads Google Maps API
 * 
 * @param {string} apiKey - Google Maps API key from environment
 * @returns {Promise<object>} Google object with maps property
 * @throws {Error} If API key is missing or script fails to load
 */
export function loadGoogleMapsAPI(apiKey) {
  // Return cached promise if already loading/loaded
  if (googlePromise) {
    return googlePromise
  }

  googlePromise = new Promise((resolve, reject) => {
    try {
      // Validate API key
      if (!apiKey) {
        throw new Error('Google Maps API key is not configured in environment (VUE_APP_GOOGLE_MAPS_API_KEY)')
      }

      // Check if already loaded
      if (window.google?.maps) {
        resolve(window.google)
        return
      }

      // Check if script already exists in DOM
      const scriptId = 'google-maps-script'
      const existingScript = document.getElementById(scriptId)

      if (existingScript) {
        // Wait for existing script to load
        let attempts = 0
        const checkReady = setInterval(() => {
          attempts++
          if (window.google?.maps) {
            clearInterval(checkReady)
            resolve(window.google)
          } else if (attempts > 50) { // 5 second timeout
            clearInterval(checkReady)
            reject(new Error('Google Maps script loaded but google.maps is unavailable'))
          }
        }, 100)
        return
      }

      // Create and inject script with places and maps libraries
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`
      script.async = true
      script.defer = true

      script.onload = () => {
        let attempts = 0
        const checkReady = setInterval(() => {
          attempts++
          if (window.google?.maps) {
            clearInterval(checkReady)
            resolve(window.google)
          } else if (attempts > 50) { // 5 second timeout
            clearInterval(checkReady)
            reject(new Error('Google Maps script loaded but google.maps is unavailable'))
          }
        }, 100)
      }

      script.onerror = () => {
        googlePromise = null // Reset for retry
        reject(new Error('Failed to load Google Maps script from CDN'))
      }

      document.head.appendChild(script)
    } catch (error) {
      reject(error)
    }
  })

  return googlePromise
}


