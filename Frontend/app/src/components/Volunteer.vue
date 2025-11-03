<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error -->
<script setup>
import { ref, onMounted } from 'vue'
import { loadGoogleMapsAPI } from '@/utils/googleMaps.js'

const locationInput = ref(null)
const error = ref('')
const isLoading = ref(false)
const form = ref({
  name: '',
  phone: '',
  email: '',
  location: '',
  availability: '',
  experience: '',
  reason: '',
  skills: []
})

// Initialize Places Autocomplete for cities only
async function initializeLocationAutocomplete() {
  try {
    const google = await loadGoogleMapsAPI(process.env.VUE_APP_GOOGLE_MAPS_API_KEY)
    if (!locationInput.value) return

    const { Autocomplete } = await google.maps.importLibrary('places')
    
    // Set North Macedonia bounds
    const bounds = new google.maps.LatLngBounds(
      { lat: 40.8537, lng: 20.4524 }, // SW corner
      { lat: 42.3583, lng: 23.0347 }  // NE corner
    )

    const autocomplete = new Autocomplete(locationInput.value, {
      bounds,
      strictBounds: true,
      types: ['(cities)'],
      componentRestrictions: { country: 'MK' },
      fields: ['formatted_address', 'geometry', 'name']
    })

    // Handle place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        form.value.location = place.formatted_address
      } else if (place.name) {
        form.value.location = place.name
      }
    })
  } catch (err) {
    console.error('Failed to initialize location autocomplete:', err)
    error.value = 'Failed to load location services. Please try refreshing the page.'
    // Enable manual input as fallback
    if (locationInput.value) {
      locationInput.value.removeAttribute('disabled')
    }
  }
}

async function submitVolunteerForm() {
  if (isLoading.value) return
  isLoading.value = true
  error.value = ''
  try {
    const payload = {
      Name: form.value.name.trim(),
      Email: form.value.email.trim(),
      Phone: form.value.phone.trim(),
      Location: form.value.location.trim(),
      Skills: form.value.skills,
      Availability: form.value.availability.trim(),
      Experience: (form.value.experience || '').trim(),
      Reason: form.value.reason.trim()
    }
    const response = await fetch('http://localhost:5000/api/volunteers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit volunteer application')
    }
    form.value = {
      name: '',
      phone: '',
      email: '',
      location: '',
      availability: '',
      experience: '',
      reason: '',
      skills: []
    }
    alert('Thank you for your interest in volunteering! We will contact you soon.')
  } catch (err) {
    console.error('Error submitting volunteer form:', err)
    error.value = err.message || 'Failed to submit application. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initializeLocationAutocomplete()
})
</script>

<template>
  <div class="volunteer-page">
    <div class="volunteer-container">
      <h2>Become a Volunteer</h2>
      <p class="subtitle">
        Help us make a difference in the lives of stray dogs
      </p>

      <form 
        class="volunteer-form" 
        @submit.prevent="submitVolunteerForm">
        <div class="form-group">
          <label for="name">
            Full Name*
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            required
            placeholder="Enter your full name">
        </div>

        <div class="form-group">
          <label for="phone">
            Phone Number*
          </label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="form-input"
            required
            placeholder="+389 XX XXX XXX">
        </div>

        <div class="form-group">
          <label for="email">
            Email*
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            required
            placeholder="Enter your email">
        </div>

        <div class="form-group">
          <label for="location">
            Location*
          </label>
          <input
            id="location"
            ref="locationInput"
            v-model="form.location"
            type="text"
            class="form-input"
            required
            placeholder="Your city in North Macedonia">
        </div>

        <div class="form-group">
          <label for="availability">
            Availability*
          </label>
          <select
            id="availability"
            v-model="form.availability"
            class="form-input"
            required>
            <option value="">
              Select your availability
            </option>
            <option value="weekdays">
              Weekdays
            </option>
            <option value="weekends">
              Weekends
            </option>
            <option value="both">
              Both Weekdays and Weekends
            </option>
            <option value="flexible">
              Flexible
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="experience">
            Previous Experience with Dogs
          </label>
          <textarea
            id="experience"
            v-model="form.experience"
            class="form-input"
            rows="4"
            placeholder="Tell us about any experience you have with dogs (optional)">
          </textarea>
        </div>

        <div class="form-group">
          <label for="reason">
            Why do you want to volunteer?*
          </label>
          <textarea
            id="reason"
            v-model="form.reason"
            class="form-input"
            rows="4"
            required
            placeholder="Tell us why you want to help stray dogs">
          </textarea>
        </div>

        <div class="form-group">
          <label>Relevant Skills</label>
          <div class="skills-checkboxes">
            <label class="checkbox-label">
              <input
                v-model="form.skills"
                type="checkbox"
                value="driving">
              Driving
            </label>
            <label class="checkbox-label">
              <input
                v-model="form.skills"
                type="checkbox"
                value="first_aid">
              Pet First Aid
            </label>
            <label class="checkbox-label">
              <input
                v-model="form.skills"
                type="checkbox"
                value="training">
              Dog Training
            </label>
            <label class="checkbox-label">
              <input
                v-model="form.skills"
                type="checkbox"
                value="medical">
              Medical/Veterinary
            </label>
          </div>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading">
          <span
            v-if="isLoading"
            class="loading-spinner">
          </span>
          {{ isLoading ? 'Submitting...' : 'Submit Application' }}
        </button>

        <div
          v-if="error"
          class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.volunteer-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.volunteer-container {
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

.volunteer-form {
  max-width: 600px;
  margin: 0 auto;
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

.skills-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
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
</style>