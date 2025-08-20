<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="adopt-container">
    <h2>Dogs Available for Adoption</h2>
    <div v-if="dogs.length" class="dogs-grid">
      <div v-for="dog in dogs" :key="dog.id" class="dog-card">
        <div class="dog-image">
          <img :src="getImageUrl(dog.ImageUrl)" :alt="dog.Name">
        </div>
        <div class="dog-info">
          <h3>{{ dog.Name }}</h3>
          <p><strong>Breed:</strong> {{ dog.Breed }}</p>
          <p><strong>Age:</strong> {{ dog.Age }} years</p>
          <button class="adopt-button" @click="adoptDog(dog.id)">Adopt Now</button>
        </div>
      </div>
    </div>
    <p v-else class="no-dogs">No dogs currently available for adoption.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dogs = ref([])
const error = ref(null)

// Function to get full image URL
function getImageUrl(imageUrl) {
  if (!imageUrl) return '/placeholder-dog.jpg'
  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('/')) return `http://localhost:5000${imageUrl}`
  // Handle local uploaded images
  return `http://localhost:5000/uploads/${imageUrl}`
}

// Fetch dogs
async function fetchDogs() {
  try {
    error.value = null
    const res = await fetch('http://localhost:5000/api/animals')
    if (!res.ok) throw new Error('Failed to fetch dogs')
    dogs.value = await res.json()
  } catch (err) {
    console.error('Error fetching dogs:', err)
    error.value = 'Failed to load available dogs. Please try again later.'
  }
}

function adoptDog(id) {
  // Trigger adoption flow
  console.log('Adopt dog with ID:', id)
}

// Initial fetch
onMounted(() => {
  fetchDogs()
})
</script>

<style scoped>
.adopt-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
}

.dog-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.dog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.dog-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.dog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dog-info {
  padding: 1.5rem;
}

.dog-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.dog-info p {
  margin: 0.5rem 0;
  color: #666;
}

.adopt-button {
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.adopt-button:hover {
  background-color: #45a049;
}

.no-dogs {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}

@media (max-width: 768px) {
  .adopt-container {
    padding: 1rem;
  }
  
  .dogs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>