<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline -->
<template>
  <div class="adoption-form-page">
    <div class="adoption-form-container">
      <h2>Adoption Application</h2>
      <p class="subtitle" v-if="animalDetails">
        You are applying to adopt {{ animalDetails.Name }}, {{ animalDetails.Breed }}
      </p>

      <form class="adoption-form" @submit.prevent="submitAdoptionForm">
        <div class="form-group">
          <label for="name">Full Name*</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input-field"
            required
            placeholder="Enter your full name"
          >
        </div>

        <div class="form-group">
          <label for="email">Email Address*</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input-field"
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="phone">Phone Number*</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="form-input-field"
            required
            placeholder="+389 XX XXX XXX"
          >
        </div>

        <div class="form-group">
          <label for="address">Home Address*</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            class="form-input-field"
            required
            placeholder="Enter your full address"
          >
        </div>

        <div class="form-group">
          <label for="homeType">Type of Home*</label>
          <select
            id="homeType"
            v-model="form.homeType"
            class="form-input-field"
            required
          >
            <option value="">Select your home type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="form.hasYard"
              type="checkbox"
            >
            Do you have a yard?
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="form.hasPets"
              type="checkbox"
            >
            Do you have other pets?
          </label>
        </div>

        <div class="form-group" v-if="form.hasPets">
          <label for="existingPets">Tell us about your current pets</label>
          <textarea
            id="existingPets"
            v-model="form.existingPets"
            class="form-input"
            rows="3"
            placeholder="Type, age, and temperament of your current pets"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="workSchedule">Work Schedule*</label>
          <select
            id="workSchedule"
            v-model="form.workSchedule"
            class="form-input"
            required
          >
            <option value="">Select your work schedule</option>
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="remote">Remote/Work from home</option>
            <option value="flexible">Flexible</option>
            <option value="retired">Retired/Not working</option>
          </select>
        </div>

        <div class="form-group">
          <label for="experience">Previous Pet Experience</label>
          <textarea
            id="experience"
            v-model="form.experience"
            class="form-input"
            rows="4"
            placeholder="Tell us about your experience with pets (if any)"
          ></textarea>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="loading-spinner"
          />
          {{ isLoading ? 'Submitting...' : 'Submit Application' }}
        </button>

        <div
          v-if="error"
          class="error-message"
        >
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const animalDetails = ref(null)
const isLoading = ref(false)
const error = ref('')

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  homeType: '',
  hasYard: false,
  hasPets: false,
  existingPets: '',
  workSchedule: '',
  experience: ''
})

async function fetchAnimalDetails() {
  try {
    const response = await fetch(`http://localhost:5000/api/animals/${route.params.animalId}`)
    if (!response.ok) throw new Error('Failed to fetch animal details')
    animalDetails.value = await response.json()
  } catch (err) {
    console.error('Error fetching animal details:', err)
    error.value = 'Failed to load animal details'
  }
}

async function submitAdoptionForm() {
  if (isLoading.value) return;
  isLoading.value = true;
  error.value = '';
  try {
    const payload = {
      AnimalId: Number(route.params.animalId),
      Name: form.value.name,
      Email: form.value.email,
      Phone: form.value.phone,
      Address: form.value.address,
      HomeType: form.value.homeType,
      HasYard: form.value.hasYard,
      HasPets: form.value.hasPets,
      ExistingPets: form.value.existingPets,
      WorkSchedule: form.value.workSchedule,
      Experience: form.value.experience,
      Status: 'pending'
    };
    const response = await fetch(`http://localhost:5000/api/animals/${route.params.animalId}/adopt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('Failed to submit adoption application');
    }
    alert('Thank you for your adoption application! We will contact you soon.');
    router.push('/adopt');
  } catch (err) {
    console.error('Error submitting adoption form:', err);
    error.value = 'Failed to submit application. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  if (route.params.animalId) {
    fetchAnimalDetails();
  } else {
    router.push('/adopt');
  }
});
</script>

<style scoped>
.adoption-form-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.adoption-form-container {
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

.adoption-form {
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

.checkbox-group {
  margin: 1rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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

.submit-button {
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

.submit-button:hover {
  background: #45a049;
}

.submit-button:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  text-align: center;
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
</style>