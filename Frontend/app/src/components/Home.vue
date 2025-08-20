<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Stray Care</h1>
        <p>Giving every stray dog a chance at a happy life</p>
        <div class="hero-buttons">
          <router-link to="/adopt" class="btn-primary">Adopt a Dog</router-link>
          <router-link to="/donate" class="btn-secondary">Make a Donation</router-link>
        </div>
      </div>
    </section>

    <!-- Featured Dogs Section -->
    <section class="featured-dogs">
      <h2>Dogs Available for Adoption</h2>
      <div class="dogs-grid">
        <div v-for="dog in featuredDogs" :key="dog.id" class="dog-card">
          <div class="dog-image">
            <img :src="getImageUrl(dog.ImageUrl)" :alt="dog.Name">
          </div>
          <div class="dog-info">
            <h3>{{ dog.Name }}</h3>
            <p>{{ dog.Breed }} • {{ dog.Age }} years</p>
            <router-link :to="'/adopt/' + dog.id" class="btn-adopt">Meet Me</router-link>
          </div>
        </div>
      </div>
      <router-link to="/adopt" class="btn-view-all">View All Dogs</router-link>
    </section>

    <!-- Our Mission Section -->
    <section class="mission">
      <div class="mission-content">
        <h2>Our Mission</h2>
        <p>We are dedicated to reducing and controlling the stray dog population through:</p>
        <ul>
          <li>Rescuing and rehabilitating stray dogs</li>
          <li>Providing medical care and sterilization</li>
          <li>Finding loving forever homes</li>
          <li>Promoting responsible pet ownership</li>
        </ul>
        <router-link to="/about" class="btn-learn-more">Learn More About Us</router-link>
      </div>
    </section>

    <!-- Success Stories -->
    <section class="success-stories">
      <h2>Recently Adopted</h2>
      <div class="stories-grid">
        <div v-for="story in successStories" :key="story.id" class="story-card">
          <img :src="getImageUrl(story.imageUrl)" :alt="story.name">
          <div class="story-overlay">
            <h3>{{ story.name }}</h3>
            <p>Found a loving home</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const featuredDogs = ref([])
const successStories = ref([])

function getImageUrl(imageUrl) {
  if (!imageUrl) return '/placeholder-dog.jpg'
  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('/')) return `http://localhost:5000${imageUrl}`
  // Handle local uploaded images
  return `http://localhost:5000/uploads/${imageUrl}`
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

.dog-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.dog-card:hover {
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

.btn-adopt {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  transition: background 0.2s;
}

.btn-adopt:hover {
  background: #45a049;
}

.btn-view-all {
  display: block;
  text-align: center;
  margin-top: 2rem;
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.mission {
  background: #f9f9f9;
  text-align: center;
}

.mission-content {
  max-width: 800px;
  margin: 0 auto;
}

.mission ul {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
}

.mission li {
  margin: 1rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.mission li:before {
  content: "•";
  color: #4CAF50;
  position: absolute;
  left: 0;
}

.btn-learn-more {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  transition: background 0.2s;
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
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
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