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
      <button class="button button-primary" @click="showAddDogModal = true">
        Add New Dog
      </button>
    </div>

    <div class="dashboard-grid" :class="{ 'admin-grid': isAdmin }">
      <!-- Dogs List -->
      <div class="content-card dogs-card">
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
            <button class="button button-primary" @click="fetchDogs">Try Again</button>
          </div>

          <div v-else-if="dogs.length === 0" class="empty-state">
            <p>No dogs available at the moment.</p>
            <button v-if="isAdmin" class="button button-primary" @click="showDogModal = true">Add First Dog</button>
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
              <button class="button button-edit" @click="editDog(dog)">
                Edit
              </button>
              <button class="button button-delete" @click="deleteDog(dog.AnimalId)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only Sections -->
      <template v-if="isAdmin">
        <!-- Volunteers List -->
        <div class="content-card">
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
                <button class="button button-success" :disabled="volunteer.Status === 'Approved'" @click="updateVolunteerStatus(volunteer.VolunteerId, 'Approved')">
                  Approve
                </button>
                <button class="button button-danger" :disabled="volunteer.Status === 'Rejected'" @click="updateVolunteerStatus(volunteer.VolunteerId, 'Rejected')">
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
        <div class="content-card">
          <div class="card-header">
            <h3>Recent Donations</h3>
            <button class="button button-secondary" @click="openHistoryModal('donations', 'Donation History')">View All</button>
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

        <!-- Adoption Applications -->
        <div class="content-card">
          <div class="card-header">
            <h3>Adoption Applications</h3>
            <button class="button button-secondary" @click="openHistoryModal('adoptions', 'Adoption History')">View All</button>
          </div>
          <div class="list-content">
            <div v-for="application in allAdoptions" :key="application.AdoptionId" class="list-item">
              <div class="application-info">
                <h4>{{ application.Name }}</h4>
                <div class="contact-info">
                  <span>Email: {{ application.Email }}</span>
                  <span>Phone: {{ application.Phone }}</span>
                </div>
                <p>Home Type: {{ application.HomeType }}</p>
                <p>Has Pets: {{ application.HasPets ? 'Yes' : 'No' }}</p>
                <p v-if="application.ExistingPets">Existing Pets: {{ application.ExistingPets }}</p>
                <p>Has Yard: {{ application.HasYard ? 'Yes' : 'No' }}</p>
                <p>Work Schedule: {{ application.WorkSchedule }}</p>
                <p>Experience: {{ application.Experience }}</p>
              </div>
              <div class="application-actions">
                <button class="button button-success" @click="updateAdoptionStatus(application.AdoptionId, 'Approved')">
                  Approve
                </button>
                <button class="button button-danger" @click="updateAdoptionStatus(application.AdoptionId, 'Rejected')">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports List -->
        <div class="content-card">
          <div class="card-header">
            <h3>Stray Reports</h3>
            <button class="button button-secondary" @click="openHistoryModal('reports', 'Report History')">View All</button>
          </div>
          <div class="list-content">
            <div v-for="report in allReports" :key="report.ReportId" class="list-item">
              <div class="report-info">
                <div class="report-header">
                  <span class="report-location">{{ report.Location }}</span>
                  <span class="report-status" :class="report.Status.toLowerCase()">{{ report.Status }}</span>
                </div>
                <div class="report-details">
                  <p>{{ report.Details }}</p>
                  <div v-if="report.Images && report.Images.length > 0" class="image-gallery">
                    <img v-for="(image, index) in JSON.parse(report.Images)" :key="index" :src="image" alt="Report image" class="report-image" @click="openImage(image)">
                  </div>
                  <div v-if="report.Coordinates" class="coordinates">
                    {{ formatCoordinates(JSON.parse(report.Coordinates)) }}
                  </div>
                </div>
              </div>
              <div class="report-actions">
                <button class="button button-success" @click="updateReportStatus(report.ReportId, 'Resolved')">
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modals -->
    <div v-if="showDogModal" class="modal-overlay" @click.self="closeDogModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Dog' : 'Add New Dog' }}</h3>
          <button class="modal-close" @click="closeDogModal">&times;</button>
        </div>
        <form class="modal-form" @submit.prevent="handleDogSubmit">
          <div class="form-group">
            <label for="dogName">Name</label>
            <input id="dogName" v-model="currentDog.Name" type="text" required class="form-input-field">
          </div>
          <div class="form-group">
            <label for="dogBreed">Breed</label>
            <input id="dogBreed" v-model="currentDog.Breed" type="text" required class="form-input-field">
          </div>
          <div class="form-group">
            <label for="dogAge">Age</label>
            <input id="dogAge" v-model="currentDog.Age" type="number" required class="form-input-field">
          </div>
          <div class="form-group">
            <label for="dogDescription">Description</label>
            <textarea id="dogDescription" v-model="currentDog.Description" required class="form-input-field"></textarea>
          </div>
          <div class="form-group">
            <label for="dogImage">Image</label>
            <input id="dogImage" type="file" class="form-input-field" @change="handleImageUpload">
            <img v-if="currentDog.Image" :src="currentDog.Image" alt="Dog preview" class="image-preview">
          </div>
          <div class="modal-actions">
            <button type="button" class="button button-secondary" @click="closeDogModal">Cancel</button>
            <button type="submit" class="button button-primary">{{ isEditing ? 'Save Changes' : 'Add Dog' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showHistoryModal" class="modal-overlay" @click.self="closeHistoryModal">
      <div class="modal-content history-modal">
        <div class="modal-header">
          <h3>{{ historyTitle }}</h3>
          <button class="modal-close" @click="closeHistoryModal">&times;</button>
        </div>
        <div class="history-content">
          <!-- Render history content based on historyType -->
        </div>
        <div class="modal-actions">
          <button class="button button-secondary" @click="closeHistoryModal">Close</button>
        </div>
      </div>
    </div>

    <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
      <div class="modal-content image-modal">
        <img :src="currentImage" alt="Full size dog photo">
        <button class="modal-close" @click="closeImageModal">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// State
const dogs = ref([])
const volunteers = ref([])
const donations = ref([])
const user = ref(null)
const isAdmin = ref(false)
const isLoading = ref(false)
const error = ref(null)

// Modal states
const showDogModal = ref(false)
const showHistoryModal = ref(false)
const showImageModal = ref(false)
const isEditing = ref(false)
const currentDog = ref({})
const currentImage = ref('')
const historyType = ref('')
const historyTitle = ref('')

// All data for history modals
const allReports = ref([])
const allAdoptions = ref([])

const router = useRouter()

// Dog operations
function editDog(dog) {
  isEditing.value = true
  currentDog.value = { ...dog }
  showDogModal.value = true
}

function closeDogModal() {
  showDogModal.value = false
  isEditing.value = false
  currentDog.value = {}
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onloadend = () => {
      currentDog.value.Image = reader.result
    }
    reader.readAsDataURL(file)
  }
}

async function handleDogSubmit() {
  if (isEditing.value) {
    // Update dog
    try {
      const response = await fetch(`http://localhost:5000/api/animals/${currentDog.value.AnimalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(currentDog.value)
      })

      // Handle expired token (401 Unauthorized)
      if (response.status === 401) {
        console.error('Token expired - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to update dog')

      const updatedDog = await response.json()
      const index = dogs.value.findIndex(d => d.AnimalId === updatedDog.AnimalId)
      if (index !== -1) {
        dogs.value[index] = updatedDog
      }
    } catch (error) {
      console.error('Error updating dog:', error)
      alert('Failed to update dog. Please try again.')
    } finally {
      closeDogModal()
    }
  } else {
    // Add new dog
    try {
      const response = await fetch('http://localhost:5000/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(currentDog.value)
      })

      // Handle expired token (401 Unauthorized)
      if (response.status === 401) {
        console.error('Token expired - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to add dog')

      const newDog = await response.json()
      dogs.value.push(newDog)
      closeDogModal()
    } catch (error) {
      console.error('Error adding dog:', error)
      alert('Failed to add dog. Please try again.')
    }
  }
}

async function deleteDog(animalId) {
  if (!confirm('Are you sure you want to delete this dog?')) return

  try {
    const response = await fetch(`http://localhost:5000/api/animals/${animalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      console.error('Token expired - redirecting to login');
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) throw new Error('Failed to delete dog')

    dogs.value = dogs.value.filter(dog => dog.AnimalId !== animalId)
  } catch (error) {
    console.error('Error deleting dog:', error)
  }
}

// Volunteer operations
async function updateVolunteerStatus(volunteerId, status) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/volunteers/${volunteerId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      console.error('Token expired - redirecting to login');
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update volunteer status: ${errorText}`);
    }

    const updatedVolunteer = await response.json();

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
  currentImage.value = image
  showImageModal.value = true
}

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
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      router.push('/login');
      return;
    }

    const response = await fetch('http://localhost:5000/api/volunteers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      console.error('Token expired - redirecting to login');
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch volunteers: ${response.status} ${errorText}`);
    }

    const data = await response.json();

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
  } catch (error) {
    console.error('Error fetching volunteers:', error);
  }
}

async function fetchDonations() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found');
      router.push('/login');
      return;
    }

    const response = await fetch('http://localhost:5000/api/donations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      console.error('Token expired - redirecting to login');
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

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
  historyTitle.value = ''
}

function openHistoryModal(type, title) {
  historyType.value = type
  historyTitle.value = title
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
  background-color: #f9f9f9;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-actions {
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.admin-grid {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.content-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.list-content {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.list-item:last-child {
  border-bottom: none;
}

.dog-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  align-items: start;
}

.dog-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.dog-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dog-info h4 {
  margin: 0 0 0.5rem;
}

.dog-info p {
  margin: 0.25rem 0;
  color: #666;
}

.dog-description {
  font-size: 0.9rem;
  color: #888;
  white-space: pre-wrap;
}

.dog-actions, .volunteer-actions, .application-actions, .report-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.volunteer-info, .application-info, .report-info {
  flex-grow: 1;
}

.contact-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #555;
  margin: 0.5rem 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
  justify-self: start;
  margin-top: 0.5rem;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.resolved {
  background-color: #d1ecf1;
  color: #0c5460;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.modal-form .form-group {
  margin-bottom: 1rem;
}

.form-input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.image-preview {
  margin-top: 1rem;
  max-width: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.history-modal {
  max-width: 800px;
}

.image-modal {
  padding: 0;
  background: none;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.image-modal .modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: white;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
}
</style>