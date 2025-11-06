<!-- eslint-disable vue/html-closing-bracket-newline -->
<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="report-page">
    <div class="report-container">
      <h2>Report a Stray Dog</h2>
      <p class="subtitle">
        Help us locate and rescue stray dogs in North Macedonia
      </p>

      <div class="form-and-map">
        <div class="report-form">
          <form @submit.prevent="submitReport">
            <div class="form-group">
              <label for="location">
                Location
              </label>
              <input
                id="location"
                ref="locationInput"
                v-model="report.location"
                class="form-input-field"
                placeholder="Enter location in North Macedonia"
                required
              >
            </div>

            <div class="form-group">
              <label for="details">
                Details
              </label>
              <textarea
                id="details"
                v-model="report.details"
                class="form-input-field"
                placeholder="Describe the dog and situation (color, size, condition, etc.)"
                required
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                Upload Photos (optional)
              </label>
              <input
                class="form-input-field"
                type="file"
                accept="image/*"
                multiple
                @change="handleImageUpload"
              >
            </div>

            <button
              type="submit"
              class="button"
              :disabled="isLoading"
            >
              <span
                v-if="isLoading"
                class="loading-spinner"
              />
              {{ isLoading ? 'Submitting...' : 'Submit Report' }}
            </button>

            <div
              v-if="error"
              class="error-message"
            >
              {{ error }}
            </div>
          </form>
        </div>

        <div class="map-container">
          <div
            v-if="!mapLoaded"
            class="map-loading"
          >
            Loading map...
          </div>
          <div
            ref="mapElement"
            class="google-map"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadGoogleMapsAPI } from '@/utils/googleMaps.js'

const mapElement = ref(null)
const map = ref(null)
let currentMarker = null 
const isLoading = ref(false)
const error = ref('')
const geocoder = ref(null)
const mapLoaded = ref(false)
const locationInput = ref(null) 
let placeAutocomplete = null

// Function to manage markers - ensures only one marker exists
function setMarker(position) {
  // Always remove existing marker
  if (currentMarker) {
    currentMarker.setMap(null)
    currentMarker = null
  }

  // Create new marker if position is provided and within bounds
  if (position && 
      position.lat >= MK_BOUNDS.south && 
      position.lat <= MK_BOUNDS.north &&
      position.lng >= MK_BOUNDS.west && 
      position.lng <= MK_BOUNDS.east) {
    
    currentMarker = new window.google.maps.Marker({
      position: position,
      map: map.value,
      draggable: true
    })

    currentMarker.addListener('dragend', () => {
      const pos = currentMarker.getPosition()
      const newPosition = {
        lat: pos.lat(),
        lng: pos.lng()
      }

      if (newPosition.lat >= MK_BOUNDS.south && 
          newPosition.lat <= MK_BOUNDS.north &&
          newPosition.lng >= MK_BOUNDS.west && 
          newPosition.lng <= MK_BOUNDS.east) {
        report.value.coordinates = newPosition
        doReverseGeocode(newPosition)
      } else {
        currentMarker.setPosition(position)
      }
    })

    report.value.coordinates = position
    doReverseGeocode(position)
  }


}

// North Macedonia boundaries
const MK_BOUNDS = {
  north: 42.3583,
  south: 40.8537,
  west: 20.4632,
  east: 23.0345
}

const report = ref({
  location: '',
  details: '',
  coordinates: null,
  images: []
})

async function initMap() {
  try {
    const google = await loadGoogleMapsAPI(process.env.VUE_APP_GOOGLE_MAPS_API_KEY);
    if (!mapElement.value || !locationInput.value) return;

    // Use standard Google Maps API
    const { Map, Geocoder, LatLngBounds } = google.maps;
    const { Autocomplete } = google.maps.places;

    map.value = new Map(mapElement.value, {
      center: { lat: 41.6086, lng: 21.7453 }, // Center of North Macedonia
      zoom: 8,
      restriction: {
        latLngBounds: MK_BOUNDS,
        strictBounds: true
      },
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      mapTypeId: 'roadmap'
    });

    geocoder.value = new Geocoder();

    // Initialize Places Autocomplete with street-level precision
    // Note: 'address' type cannot be mixed with specific types like 'street_address', 'route', etc
    // Using only geocode type which returns all address types
    placeAutocomplete = new Autocomplete(locationInput.value, {
      bounds: new LatLngBounds(
        { lat: MK_BOUNDS.south, lng: MK_BOUNDS.west },
        { lat: MK_BOUNDS.north, lng: MK_BOUNDS.east }
      ),
      strictBounds: true,
      componentRestrictions: { country: 'MK' },
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      types: ['geocode'],
      language: 'en'
    });

    // Add click listener to map
    map.value.addListener('click', (event) => {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      
      if (clickedLocation.lat < MK_BOUNDS.south || 
          clickedLocation.lat > MK_BOUNDS.north ||
          clickedLocation.lng < MK_BOUNDS.west || 
          clickedLocation.lng > MK_BOUNDS.east) {
        
        if (currentMarker) {
          currentMarker.setMap(null)
          currentMarker = null
        }
        locationInput.value.value = ''
        report.value.location = ''
        return
      }

      setMarker(clickedLocation)
      geocoder.value.geocode(
        { 
          location: clickedLocation,
          region: 'MK',
          language: 'en'
        },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const result = results[0]
            let street = '', city = '', neighborhood = '', streetNumber = ''
            
            for (const component of result.address_components) {
              if (component.types.includes('route')) {
                street = component.long_name;
              }
              if (component.types.includes('street_number')) {
                streetNumber = component.long_name;
              }
              if (component.types.includes('locality') || 
                  component.types.includes('postal_town')) {
                city = component.long_name;
              }
              if (component.types.includes('sublocality') ||
                  component.types.includes('neighborhood')) {
                neighborhood = component.long_name;
              }
            }
            
            // Combine street number with street name if both exist
            if (streetNumber && street) {
              street = `${streetNumber} ${street}`
            }

            // Build address with all available components
            let addressParts = []
            if (street) addressParts.push(street)
            if (neighborhood) addressParts.push(neighborhood)
            if (city) addressParts.push(city)
            addressParts.push('North Macedonia')
            
            let formattedAddress = addressParts.join(', ')
            
            locationInput.value.value = formattedAddress
            report.value.location = formattedAddress
          }
        }
      )
    })

    
    placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace()
      if (!place.geometry) {
        locationInput.value.value = ''
        return
      }

      const location = place.geometry.location
      
      if (location.lat() < MK_BOUNDS.south || 
          location.lat() > MK_BOUNDS.north ||
          location.lng() < MK_BOUNDS.west || 
          location.lng() > MK_BOUNDS.east) {
        locationInput.value.value = ''
        return
      }

      setMarker(location)
      map.value.setCenter(location)
      map.value.setZoom(18) // Higher zoom level for street-level detail
      
     
      // Initialize all address components
      let street = '', city = '', neighborhood = '', streetNumber = '';
      
      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes('route')) {
            street = component.long_name;
          }
          if (component.types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (component.types.includes('locality') || 
              component.types.includes('administrative_area_level_3') ||
              component.types.includes('postal_town')) {
            city = component.long_name;
          }
          if (component.types.includes('sublocality_level_1') ||
              component.types.includes('neighborhood') ||
              component.types.includes('political')) {
            neighborhood = component.long_name;
          }
        }

        // Combine street number with street name if both exist
        if (streetNumber && street) {
          street = `${streetNumber} ${street}`;
        }
      }

      // Format address with all available components
      let addressParts = [];
      if (street) addressParts.push(street);
      if (neighborhood) addressParts.push(neighborhood);
      if (city) addressParts.push(city);
      addressParts.push('North Macedonia');
      
      let formattedAddress = addressParts.join(', ');

      report.value.location = formattedAddress
      locationInput.value.value = formattedAddress
    })

    mapLoaded.value = true
  } catch (error) {
    console.error('Error loading Google Maps:', error)
    error.value = 'Failed to load map. Please try again later.'
  }
}





async function doReverseGeocode(position) {
  if (!geocoder.value) return

  try {
    const result = await geocoder.value.geocode({
      location: position,
      region: 'MK',
      language: 'en'
    })
    
    if (result.results[0]) {
      report.value.location = result.results[0].formatted_address
    }
  } catch (err) {
    console.error('Reverse geocoding error:', err)
  }
}

function handleImageUpload(event) {
  const files = Array.from(event.target.files)
  report.value.images = files
}

async function submitReport() {
  if (!report.value.coordinates) {
    error.value = 'Please select a location on the map'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const formData = {
      Location: report.value.location,
      Details: report.value.details,
      Coordinates: report.value.coordinates,
      Images: []
    }

    if (report.value.images.length > 0) {
      try {
        const imagePromises = report.value.images.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })

        const imageUrls = await Promise.all(imagePromises)
        formData.Images = imageUrls
      } catch (err) {
        console.error('Error converting images:', err)
        error.value = 'Failed to process images. Please try again.'
        isLoading.value = false
        return
      }
    }

    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error('Failed to submit report')
    }

    // Reset form
    report.value = {
      location: '',
      details: '',
      coordinates: null,
      images: []
    }
    setMarker(null) // Remove the marker

    alert('Report submitted successfully!')
  } catch (err) {
    console.error('Error submitting report:', err)
    error.value = 'Failed to submit report. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initMap();
})
</script>

<style scoped>
.report-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.report-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 2rem;
}

h2 {
  color: #333;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.form-and-map {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.report-form {
  padding-right: 2rem;
  border-right: 1px solid #eee;
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
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.map-container {
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
  font-size: 1.1rem;
}

.google-map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #f5c6cb;
  font-weight: 500;
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

@media (max-width: 768px) {
  .form-and-map {
    grid-template-columns: 1fr;
  }

  .report-form {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }

  .map-container {
    height: 300px;
  }
}
</style>