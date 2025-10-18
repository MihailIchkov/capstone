<!-- eslint-disable vue/html-indent -->
<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line, vue/attributes-order -->
<template>
  <div class="adopt-container">
    <h2>Dogs Available for Adoption</h2>
    <div v-if="dogs.length" class="dogs-grid">
    <div v-for="Animal in dogs" :key="Animal.AnimalId" class="dog-card">
      <div class="dog-image">
        <img :src="getImageUrl(Animal.Image)" :alt="Animal.Name">
      </div>
      <div class="dog-info">
        <h3>{{ Animal.Name }}</h3>
        <p><strong>Breed:</strong> {{ Animal.Breed }}</p>
        <p><strong>Age:</strong> {{ Animal.Age }} years</p>
        <p class="dog-description">{{ Animal.Description }}</p>
        <button class="adopt-button" @click="adoptDog(Animal.AnimalId)">Adopt Now</button>
      </div>
    </div>
    </div>
    <p v-else class="no-dogs">No dogs currently available for adoption.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const dogs = ref([])
const error = ref(null)

// Function to get full image URL
function getImageUrl(imageUrl) {
  if (!imageUrl) return '/placeholder-dog.jpg'
  if (imageUrl.startsWith('http')) return imageUrl
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

const router = useRouter()
function adoptDog(animalId) {
  router.push({ name: 'AdoptionForm', params: { animalId: animalId } })
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

.dog-description {
  margin: 1rem 0;
  font-style: italic;
  color: #555;
  line-height: 1.4;
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