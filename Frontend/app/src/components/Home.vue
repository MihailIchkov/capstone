<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line, vue/attributes-order -->
<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Stray Care</h1>
        <p>Giving every stray dog a chance at a happy life</p>
        <div class="hero-buttons">
          <router-link to="/adopt" class="button button-primary">Adopt a Dog</router-link>
          <router-link to="/donate" class="button button-secondary">Make a Donation</router-link>
        </div>
      </div>
    </section>

    <!-- Featured Dogs Section -->
    <section class="featured-dogs">
      <h2>Dogs Available for Adoption</h2>
      <div class="dogs-grid">
        <div v-for="dog in featuredDogs" :key="dog.AnimalId" class="content-card">
          <div class="dog-image">
            <img :src="getImageUrl(dog.Image)" :alt="dog.Name">
          </div>
          <div class="dog-info">
            <h3>{{ dog.Name }}</h3>
            <p>{{ dog.Breed }} • {{ dog.Age }} years</p>
            <p class="dog-brief">{{ dog.Description?.substring(0, 100) }}{{ dog.Description?.length > 100 ? '...' : '' }}</p>
            <button class="button" @click="adoptDog(dog.AnimalId)">Adopt Me</button>
          </div>
        </div>
      </div>
      <router-link to="/adopt" class="button">View All Dogs</router-link>
    </section>

    <!-- Our Mission Section -->
    <section class="mission">
      <div class="mission-content">
        <h2>Our Mission</h2>
        <p>We are dedicated to reducing and controlling the stray dog population through rescuing and rehabilitating stray dogs providing medical care and sterilization finding loving forever homes and promoting responsible pet ownership</p>
      </div>
    </section>

    <!-- Volunteer Section -->
    <section class="volunteer-section">
      <div class="volunteer-content">
        <h2>Become a Volunteer</h2>
        <p>Join our team of dedicated volunteers and help make a difference in the lives of stray dogs</p>
        <div class="volunteer-benefits">
          <div class="benefit">
            <h3>Make a Difference</h3>
            <p>Help stray dogs find loving homes and get the care they need</p>
          </div>
          <div class="benefit">
            <h3>Join Our Community</h3>
            <p>Meet like-minded people who share your passion for animal welfare</p>
          </div>
          <div class="benefit">
            <h3>Gain Experience</h3>
            <p>Learn valuable skills in animal care and rescue operations</p>
          </div>
        </div>
        <router-link to="/volunteer" class="button">Volunteer With Us</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const featuredDogs = ref([])

function getImageUrl(imageUrl) {
  if (!imageUrl) return '/placeholder-dog.jpg'
  return imageUrl
}

async function fetchFeaturedDogs() {
  try {
    const response = await fetch('http://localhost:5000/api/animals?limit=4')
    const data = await response.json()
    featuredDogs.value = data
  } catch (error) {
    console.error('Error fetching featured dogs:', error)
  }
}

function adoptDog(animalId) {
  router.push({ name: 'AdoptionForm', params: { animalId: animalId } })
}

onMounted(() => {
  fetchFeaturedDogs()
})
</script>

<style scoped>
.home {
  width: 100%;
  overflow: hidden;
}

.hero {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 800px;
  padding: 2rem;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
}

.featured-dogs, .mission, .success-stories {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.content-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.content-card:hover {
  transform: translateY(-5px);
}

.dog-image {
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
  text-align: center;
}

.dog-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.dog-info p {
  color: #666;
  margin-bottom: 1rem;
}

.dog-brief {
  font-style: italic;
  color: #555;
  line-height: 1.4;
  font-size: 0.95rem;
}

.button {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  transition: background 0.2s;
  border: none;
  cursor: pointer;
}

.button:hover {
  background: #45a049;
}

.button-primary {
  background: #4CAF50;
  color: white;
}

.button-primary:hover {
  background: #45a049;
}

.button-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.button-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mission {
  background: #f9f9f9 transparent;
  text-align: center;
}

.mission-content {
  max-width: 800px;
  margin: 0 auto;
  align-content: center;
}

.mission h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.mission p {
  color: #666;
  line-height: 1.6;
}

.volunteer-section {
  background: #f5f5f5 transparent;
  padding: 4rem 2rem;
  text-align: center;
}

.volunteer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.volunteer-content h2 {
  margin-bottom: 1rem;
  color: #333;
}

.volunteer-content > p {
  color: #666;
  max-width: 600px;
  margin: 0 auto 3rem;
}

.volunteer-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.benefit {
  padding: 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.benefit:hover {
  transform: translateY(-5px);
}

.benefit h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.benefit p {
  color: #666;
  margin: 0;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.story-card {
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
}

.story-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(254, 253, 253, 0.8));
  padding: 1rem;
  color: white;
}

.story-overlay h3 {
  margin: 0;
  font-size: 1.1rem;
}

.story-overlay p {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .hero p {
    font-size: 1.2rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .dogs-grid {
    grid-template-columns: 1fr;
  }
}
</style>