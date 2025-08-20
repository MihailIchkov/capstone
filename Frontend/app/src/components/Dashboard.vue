<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <div v-if="user" class="user-info">
        <span>Welcome, {{ user.name }}</span>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Quick Stats -->
      <div class="dashboard-card stats">
        <h3>Quick Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalDogs }}</div>
            <div class="stat-label">Dogs Listed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${{ totalDonations }}</div>
            <div class="stat-label">Total Donations</div>
          </div>
        </div>
      </div>

      <!-- Recent Dogs -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>Recently Added Dogs</h3>
          <button class="btn btn-primary" @click="showAddDogModal = true">
            Add New Dog
          </button>
        </div>
        
        <div class="dogs-list">
          <div
            v-for="dog in recentDogs" 
            :key="dog.id" 
            class="dog-item"
          >
            <div class="dog-image-container">
              <img
                :src="getImageUrl(dog.ImageUrl)"
                :alt="dog.Name"
                class="dog-image"
              />
            </div>
            <div class="dog-info">
              <h4>{{ dog.Name }}</h4>
              <p>{{ dog.Breed }} • {{ dog.Age }} years old</p>
              <p
                v-if="dog.Description"
                class="dog-description"
              >
                {{ dog.Description }}
              </p>
            </div>
            <div class="dog-actions">
              <button
                class="btn btn-edit"
                @click="editDog(dog)"
              >
                Edit
              </button>
              <button
                class="btn btn-delete"
                @click="confirmDelete(dog)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Donations -->
      <div class="dashboard-card">
        <h3>Recent Donations</h3>
        <div class="donations-list">
          <div v-for="donation in recentDonations" :key="donation.id" class="donation-item">
            <div class="donation-info">
              <span class="donation-amount">${{ donation.amount }}</span>
              <span class="donation-date">{{ formatDate(donation.date) }}</span>
            </div>
            <div class="donation-details">
              <span>Transaction ID: {{ donation.transactionId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dog Modal -->
    <div v-if="showAddDogModal" class="modal">
      <div class="modal-content">
        <h3>{{ editingDog ? 'Edit Dog' : 'Add New Dog' }}</h3>
        <form @submit.prevent="saveDog">
          <div class="form-group">
            <label>Name:</label>
            <input v-model="dogForm.name" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Breed:</label>
            <input v-model="dogForm.breed" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Age:</label>
            <input v-model="dogForm.age" type="number" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Image:</label>
            <input type="file" accept="image/*" @change="handleImageUpload" class="form-control" />
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea v-model="dogForm.description" class="form-control"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" @click="showAddDogModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete {{ selectedDog?.name }}?</p>
        <div class="modal-actions">
          <button class="btn" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-delete" @click="deleteDog">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// State
const user = ref(null)
const recentDogs = ref([])
const recentDonations = ref([])
const totalDogs = ref(0)
const totalDonations = ref(0)
const showAddDogModal = ref(false)
const showDeleteModal = ref(false)
const editingDog = ref(null)
const selectedDog = ref(null)
const dogForm = ref({
  name: '',
  breed: '',
  age: '',
  description: '',
  image: null
})

// Router
const router = useRouter()

// Helper function to get full image URL
function getImageUrl(imageUrl) {
  if (!imageUrl) return '/placeholder-dog.jpg'
  if (imageUrl.startsWith('http')) return imageUrl
  if (imageUrl.startsWith('/')) return `http://localhost:5000${imageUrl}`
  // Handle local uploaded images
  return `http://localhost:5000/uploads/${imageUrl}`
}

// Fetch dashboard data
async function fetchDashboardData() {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      throw new Error('Failed to fetch dashboard data')
    }
    const data = await response.json()
    user.value = data.user
    recentDogs.value = data.recentDogs
    recentDonations.value = data.recentDonations
    totalDogs.value = data.totalDogs
    totalDonations.value = data.totalDonations
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    dogForm.value.image = file
  }
}

// Edit dog
function editDog(dog) {
  editingDog.value = dog
  dogForm.value = { ...dog }
  showAddDogModal.value = true
}

// Confirm delete
function confirmDelete(dog) {
  selectedDog.value = dog
  showDeleteModal.value = true
}

// Save dog
async function saveDog() {
  try {
    const formData = new FormData()
    formData.append('Name', dogForm.value.name)
    formData.append('Breed', dogForm.value.breed)
    formData.append('Age', dogForm.value.age)
    if (dogForm.value.image) {
      formData.append('image', dogForm.value.image)
    }

    const url = editingDog.value
      ? `http://localhost:5000/api/animals/${editingDog.value.id}`
      : 'http://localhost:5000/api/animals'
    
    const token = localStorage.getItem('token')
    const response = await fetch(url, {
      method: editingDog.value ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to save dog')

    showAddDogModal.value = false
    editingDog.value = null
    dogForm.value = { name: '', breed: '', age: '', description: '', image: null }
    await fetchDashboardData()
  } catch (error) {
    console.error('Error saving dog:', error)
  }
}

// Delete dog
async function deleteDog() {
  if (!selectedDog.value) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/animals/${selectedDog.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to delete dog')

    showDeleteModal.value = false
    selectedDog.value = null
    await fetchDashboardData()
  } catch (error) {
    console.error('Error deleting dog:', error)
  }
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Load data on mount
onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.dogs-list, .donations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dog-item, .donation-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.dog-image-container {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.dog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dog-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
  max-height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dog-info {
  flex: 1;
}

.dog-info h4 {
  margin: 0 0 0.5rem 0;
}

.dog-info p {
  margin: 0;
  color: #666;
}

.dog-actions {
  display: flex;
  gap: 0.5rem;
}

.donation-amount {
  font-weight: bold;
  color: #4CAF50;
}

.donation-date {
  color: #666;
  font-size: 0.9rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-edit {
  background: #2196F3;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>