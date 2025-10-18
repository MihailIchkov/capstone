<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line -->
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <div v-if="user" class="user-info">
        <span>Welcome, {{ user.name }}</span>
      </div>
    </div>

    <div v-if="isAdmin" class="dashboard-actions">
      <button class="btn btn-primary" @click="showAddDogModal = true">
        Add New Dog
      </button>
    </div>

    <div class="dashboard-grid" :class="{ 'admin-grid': isAdmin }">
      <!-- Dogs List -->
      <div class="dashboard-card dogs-card">
        <div class="card-header">
          <h3>Available Dogs</h3>
        </div>
        <div class="list-content">
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading available dogs...</p>
          </div>
          
          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="fetchDogs">Try Again</button>
          </div>

          <div v-else-if="dogs.length === 0" class="empty-state">
            <p>No dogs available at the moment.</p>
            <button v-if="isAdmin" class="btn btn-primary" @click="showDogModal = true">Add First Dog</button>
          </div>

          <div v-for="dog in dogs" v-else :key="dog.AnimalId" class="list-item dog-item">
            <div class="dog-image" @click="openImage(dog.Image)">
              <img :src="dog.Image" alt="Dog photo" class="dog-thumbnail">
            </div>
            <div class="dog-info">
              <h4>{{ dog.Name }}</h4>
              <p><strong>Breed:</strong> {{ dog.Breed }}</p>
              <p><strong>Age:</strong> {{ dog.Age }} years</p>
              <p class="dog-description">{{ dog.Description }}</p>
            </div>
            <div v-if="isAdmin" class="dog-actions">
              <button class="btn btn-edit" @click="editDog(dog)">
                <span class="btn-icon">✏️</span>
                Edit
              </button>
              <button class="btn btn-delete" @click="deleteDog(dog.AnimalId)">
                <span class="btn-icon">🗑️</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only Sections -->
      <template v-if="isAdmin">
        <!-- Volunteers List -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Volunteer Applications</h3>
          </div>
          <div class="list-content">
            <div v-for="volunteer in volunteers" :key="volunteer.VolunteerId" class="list-item">
              <div class="volunteer-info">
                <h4>{{ volunteer.Name }}</h4>
                <div class="contact-details">
                  <span>{{ volunteer.Location }}</span>
                  <span>{{ volunteer.Phone }}</span>
                  <span>{{ volunteer.Email }}</span>
                </div>
                <p>Experience: {{ volunteer.Experience }}</p>
              </div>
              <div class="volunteer-actions">
                <button class="btn btn-success" :disabled="volunteer.Status === 'Approved'" @click="updateVolunteerStatus(volunteer.VolunteerId, 'Approved')">
                  Approve
                </button>
                <button class="btn btn-danger" :disabled="volunteer.Status === 'Rejected'" @click="updateVolunteerStatus(volunteer.VolunteerId, 'Rejected')">
                  Reject
                </button>
              </div>
              <div class="status-badge" :class="volunteer.Status.toLowerCase()">
                {{ volunteer.Status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Donations List -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>Recent Donations</h3>
            <button class="btn btn-secondary" @click="openHistoryModal('donations', 'Donation History')">View All</button>
          </div>
          <div class="list-content">
            <div v-for="donation in donations" :key="donation.DonationId" class="list-item">
              <div class="donation-info">
                <span class="donation-amount">${{ donation.Amount }}</span>
                <span class="donation-date">{{ formatDate(donation.CreatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Add/Edit Dog Modal -->
  <div v-if="showDogModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ editingDog ? 'Edit Dog' : 'Add New Dog' }}</h3>
        <button class="btn-close" @click="closeDogModal">&times;</button>
      </div>
      <div class="modal-body">
        <form class="dog-form" @submit.prevent="saveDog">
          <div class="form-group">
            <label>Name</label>
            <input v-model="dogForm.Name" required class="form-input">
          </div>
          <div class="form-group">
            <label>Breed</label>
            <input v-model="dogForm.Breed" required class="form-input">
          </div>
          <div class="form-group">
            <label>Age</label>
            <input v-model="dogForm.Age" type="number" required class="form-input">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="dogForm.Description" required class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label>Upload Image</label>
            <input class="form-input" type="file" accept="image/*" @change="handleImageUpload">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" @click="closeDogModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <div v-if="showImageModal" class="modal" @click="showImageModal = false">
    <div class="modal-image-container">
      <img :src="selectedImage" alt="Full size image" class="modal-image">
    </div>
  </div>

  <!-- History Modal -->
  <div v-if="showHistoryModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ historyModalTitle }}</h3>
        <button class="btn-close" @click="closeHistoryModal">&times;</button>
      </div>
        
      <div class="modal-body">
        <!-- Donations History -->
        <div v-if="historyType === 'donations'" class="history-list">
          <div v-for="donation in allDonations" :key="donation.DonationId" class="history-item">
            <div class="history-item-main">
              <span class="item-amount">${{ donation.amount }}</span>
              <span class="item-date">{{ formatDate(donation.date) }}</span>
            </div>
            <div class="history-item-details">
              <span>Transaction ID: {{ donation.transactionId }}</span>
            </div>
          </div>
        </div>

        <!-- Reports History -->
        <div v-if="historyType === 'reports'" class="history-list">
          <div v-for="report in allReports" :key="report.ReportId" class="history-item">
            <div class="history-item-main">
              <div>
                <span class="item-location">{{ report.Location }}</span>
                <span class="item-status" :class="report.Status.toLowerCase()">{{ report.Status }}</span>
              </div>
              <span class="item-date">{{ formatDate(report.CreatedAt) }}</span>
            </div>
            <div class="history-item-details">
              <p>{{ report.Details }}</p>
              <div v-if="report.Images && report.Images.length > 0" class="image-gallery">
                <img v-for="(image, index) in JSON.parse(report.Images)" :key="index" :src="image" alt="Report image" class="report-image" @click="openImage(image)">
              </div>
              <div v-if="report.Coordinates" class="coordinates">
                {{ formatCoordinates(JSON.parse(report.Coordinates)) }}
              </div>
              <div v-if="isAdmin" class="action-buttons">
                <button v-for="status in ['Pending', 'In Progress', 'Resolved']" :key="status" :class="['btn', 'status-btn', status.toLowerCase()]" :disabled="report.Status === status" @click="updateReportStatus(report.ReportId, status)">{{ status }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Volunteers History -->
        <div v-if="historyType === 'volunteers'" class="history-list">
          <div v-for="volunteer in allVolunteers" :key="volunteer.VolunteerId" class="history-item">
            <div class="history-item-main">
              <span class="item-name">{{ volunteer.Name }}</span>
              <div class="contact-info">
                <span class="item-location">{{ volunteer.Location }}</span>
                <span class="item-phone">{{ volunteer.Phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Adoptions History -->
        <div v-if="historyType === 'adoptions'" class="history-list">
          <div v-for="adoption in allAdoptions" :key="adoption.AdoptionId" class="history-item">
            <div class="history-item-main">
              <span class="item-name">{{ adoption.Name }}</span>
              <span class="item-status">Status: {{ adoption.Status }}</span>
            </div>
            <div class="history-item-details">
              <div class="contact-info">
                <span class="item-email">Email: {{ adoption.Email }}</span>
                <span class="item-phone">Phone: {{ adoption.Phone }}</span>
              </div>
              <div class="adoption-details">
                <p>Home Type: {{ adoption.HomeType }}</p>
                <p>Has Pets: {{ adoption.HasPets ? 'Yes' : 'No' }}</p>
                <p v-if="adoption.ExistingPets">Existing Pets: {{ adoption.ExistingPets }}</p>
                <p>Has Yard: {{ adoption.HasYard ? 'Yes' : 'No' }}</p>
                <p>Work Schedule: {{ adoption.WorkSchedule }}</p>
                <p>Experience: {{ adoption.Experience }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// State
const isAdmin = ref(false)
const user = ref(null)
const dogs = ref([])
const volunteers = ref([])
const donations = ref([])
const showDogModal = ref(false)
const showImageModal = ref(false)
const showHistoryModal = ref(false)
const historyType = ref('')
const historyModalTitle = ref('')
const selectedImage = ref('')
const editingDog = ref(null)
const isLoading = ref(true)
const error = ref('')

// History data
const allDonations = ref([])
const allReports = ref([])
const allVolunteers = ref([])
const allAdoptions = ref([])

const dogForm = ref({
  Name: '',
  Breed: '',
  Age: null,
  Description: '',
  Image: null
})

// Dog operations
function editDog(dog) {
  editingDog.value = dog
  dogForm.value = { ...dog }
  showDogModal.value = true
}

function closeDogModal() {
  showDogModal.value = false
  editingDog.value = null
  dogForm.value = {
    Name: '',
    Breed: '',
    Age: null,
    Description: '',
    Image: null
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onloadend = () => {
      dogForm.value.Image = reader.result
    }
    reader.readAsDataURL(file)
  }
}

async function saveDog() {
  try {
    const token = localStorage.getItem('token')
    const method = editingDog.value ? 'PUT' : 'POST'
    const url = editingDog.value 
      ? `http://localhost:5000/api/animals/${editingDog.value.AnimalId}`
      : 'http://localhost:5000/api/animals'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dogForm.value)
    })

    if (!response.ok) throw new Error('Failed to save dog')

    // Refresh dogs list
    fetchDogs()
    closeDogModal()
  } catch (error) {
    console.error('Error saving dog:', error)
  }
}

async function deleteDog(animalId) {
  if (!confirm('Are you sure you want to delete this dog?')) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/animals/${animalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete dog')

    // Refresh dogs list
    fetchDogs()
  } catch (error) {
    console.error('Error deleting dog:', error)
  }
}

// Volunteer operations
async function updateVolunteerStatus(volunteerId, status) {
  try {
    console.log('Updating volunteer status:', { volunteerId, status });
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/volunteers/${volunteerId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status }) // Changed from Status to status to match backend
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update volunteer status: ${errorText}`);
    }

    const updatedVolunteer = await response.json();
    console.log('Updated volunteer:', updatedVolunteer);

    // Update volunteer status in list
    const index = volunteers.value.findIndex(v => v.VolunteerId === volunteerId);
    if (index !== -1) {
      volunteers.value[index] = updatedVolunteer;
    }
  } catch (error) {
    console.error('Error updating volunteer status:', error);
  }
}

// Image handling
function openImage(image) {
  selectedImage.value = image
  showImageModal.value = true
}

// Router
const router = useRouter()

// Computed
// Fetch data functions
async function fetchDogs() {
  isLoading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch('http://localhost:5000/api/animals', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      throw new Error('Failed to fetch dogs')
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Invalid data received from server')
    }

    dogs.value = data
  } catch (err) {
    console.error('Error fetching dogs:', err)
    error.value = 'Failed to load dogs. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function fetchVolunteers() {
  try {
    console.log('Fetching volunteers...'); // Debug log
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Making request to /api/volunteers'); // Debug log
    const response = await fetch('http://localhost:5000/api/volunteers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch volunteers: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw volunteer data:', data); // Debug log

    if (!Array.isArray(data)) {
      throw new Error('Expected array of volunteers but got: ' + typeof data);
    }

    volunteers.value = data.map(volunteer => ({
      VolunteerId: volunteer.VolunteerId,
      Name: volunteer.Name,
      Email: volunteer.Email,
      Phone: volunteer.Phone,
      Location: volunteer.Location,
      Experience: volunteer.Experience || '',
      Status: volunteer.Status || 'Pending'
    }));
    
    console.log('Processed volunteers:', volunteers.value); // Debug log
  } catch (error) {
    console.error('Error fetching volunteers:', error);
  }
}

async function fetchDonations() {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/donations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('Failed to fetch donations')
    const data = await response.json()
    donations.value = data
  } catch (error) {
    console.error('Error fetching donations:', error)
  }
}

async function checkUserRole() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }

    // Decode the JWT token (tokens are in format: header.payload.signature)
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    isAdmin.value = payload.role === 'admin'
    user.value = {
      name: payload.username || 'User',
      role: payload.role || 'User'
    }
    return true
  } catch (error) {
    console.error('Error checking user role:', error)
    isAdmin.value = false
    router.push('/login')
    return false
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

// History modal functions
function closeHistoryModal() {
  showHistoryModal.value = false
  historyType.value = ''
  historyModalTitle.value = ''
}

function openHistoryModal(type, title) {
  historyType.value = type
  historyModalTitle.value = title
  showHistoryModal.value = true
}

// Format coordinates for display
function formatCoordinates(coords) {
  if (!coords || !coords.lat || !coords.lng) return 'No coordinates available'
  return `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`
}

// Load data on mount
onMounted(async () => {
  await checkUserRole() // Wait for role check
  fetchDogs() // Always fetch dogs
  
  // Only fetch admin data if user is admin
  if (isAdmin.value) {
    fetchVolunteers()
    fetchDonations()
  }
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
  gap: 2rem;
}

/* Normal user grid - only shows dogs */
.dashboard-grid:not(.admin-grid) {
  grid-template-columns: 1fr;
  max-width: 1000px;
  margin: 0 auto;
}

/* Admin grid - shows all sections */
.admin-grid {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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

.list-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.list-item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-amount {
  font-weight: bold;
  color: #4CAF50;
}

.item-date {
  color: #666;
  font-size: 0.9rem;
}

.item-location {
  font-weight: 500;
}

.item-name {
  font-weight: 500;
}

.item-phone {
  color: #666;
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-item-details {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.item-status {
  font-weight: 500;
  color: #2196F3;
}

.item-email {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.contact-info {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.adoption-details {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.dashboard-actions {
  margin-bottom: 2rem;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #45a049;
}

.dogs-card {
  grid-column: 1 / -1;
}

.dog-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  align-items: center;
}

.dog-image {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
}

.dog-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease-in-out;
}

.dog-thumbnail:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.dog-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.dog-info p {
  margin: 0.25rem 0;
  color: #666;
  line-height: 1.4;
}

.dog-info strong {
  color: #333;
}

.dog-description {
  margin-top: 0.5rem !important;
  font-style: italic;
  color: #555 !important;
}

.btn-icon {
  margin-right: 4px;
  font-size: 1.1em;
}

.loading-state,
.error-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #4CAF50;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-state {
  color: #c62828;
}

.error-state button {
  margin-top: 1rem;
}

.empty-state {
  padding: 3rem;
}

.dog-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  background: #2196F3;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-success {
  background: #4CAF50;
  color: white;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.volunteer-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 1rem;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.approved {
  background: #e8f5e9;
  color: #388e3c;
}

.status-badge.rejected {
  background: #ffebee;
  color: #d32f2f;
}

.volunteer-info h4 {
  margin: 0 0 0.5rem 0;
}

.contact-details {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.donation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.donation-amount {
  font-weight: bold;
  color: #4CAF50;
  font-size: 1.1rem;
}

.donation-date {
  color: #666;
  font-size: 0.9rem;
}

.dog-form {
  display: grid;
  gap: 1rem;
}

.report-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.report-image:hover {
  transform: scale(1.05);
}

.coordinates {
  font-family: monospace;
  margin-top: 0.5rem;
  color: #666;
}

.action-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.status-btn {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.status-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.status-btn.pending {
  background: #ffb74d;
  color: #fff;
}

.status-btn.in-progress {
  background: #64b5f6;
  color: #fff;
}

.status-btn.resolved {
  background: #81c784;
  color: #fff;
}

.item-status {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.item-status.pending {
  background: #fff3e0;
  color: #f57c00;
}

.item-status.in-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.item-status.resolved {
  background: #e8f5e9;
  color: #388e3c;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .report-image {
    height: 120px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

.modal-image-container {
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>