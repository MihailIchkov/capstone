/**
 * Google Maps API Loader
 * Handles lazy loading of Google Maps with caching to prevent duplicate script loads
 * 
 * Features:
 * - Deduplicates script loading (prevents multiple `<script>` tags)
 * - Caches promise for reuse across components
 * - Supports async/defer loading for optimal performance
 * - Proper error handling with recovery
 * 
 * Usage:
 * ```javascript
 * import { loadGoogleMapsAPI } from '@/utils/googleMaps.js'
 * const google = await loadGoogleMapsAPI(process.env.VUE_APP_GOOGLE_MAPS_API_KEY)
 * const { Map } = google.maps
 * ```
 */

let googleMapsPromise = null

/**
 * Loads Google Maps API and caches the promise for reuse
 * Ensures script is only loaded once per session
 * 
 * Optimizations:
 * - Uses `loading=async` parameter for non-blocking script loading
 * - Adds `defer` attribute for better performance
 * - Caches promise to prevent duplicate loads
 * 
 * @param {string} apiKey - Google Maps API key from environment
 * @returns {Promise<object>} Google Maps API object (window.google)
 * @throws {Error} If API key is missing or script fails to load
 * 
 * @example
 * const google = await loadGoogleMapsAPI(apiKey)
 * const { Map, Marker } = google.maps
 */
export function loadGoogleMapsAPI(apiKey) {
  // Return cached promise if already loading/loaded
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
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
        const handleLoad = () => {
          if (window.google?.maps) {
            resolve(window.google)
          } else {
            reject(new Error('Google Maps loaded but window.google.maps is unavailable'))
          }
        }

        if (window.google?.maps) {
          handleLoad()
        } else {
          existingScript.onload = handleLoad
          existingScript.onerror = () => {
            googleMapsPromise = null // Reset for retry
            reject(new Error('Failed to load Google Maps script'))
          }
        }
        return
      }

      // Create and inject script with async/defer loading for optimal performance
      const script = document.createElement('script')
      script.id = scriptId
      script.async = true
      script.defer = true
      // Using loading=async parameter per Google best practices: https://goo.gle/js-api-loading
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=MK&language=en&loading=async`

      script.onload = () => {
        if (window.google?.maps) {
          resolve(window.google)
        } else {
          reject(new Error('Google Maps script loaded but API not available'))
        }
      }

      script.onerror = () => {
        googleMapsPromise = null // Reset for retry
        reject(new Error('Failed to load Google Maps script from CDN'))
      }

      document.head.appendChild(script)
    } catch (error) {
      reject(error)
    }
  })

  return googleMapsPromise
}


