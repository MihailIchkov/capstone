<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line -->
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <div v-if="user" class="user-info">
        <span>Welcome, {{ user.name }}</span>
      </div>
    </div>

    <div class="dashboard-grid" :class="{ 'admin-grid': isAdmin }">
      <!-- Dogs List -->
      <div class="content-card-dogs">
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
        <div class="content-card-volunteers">
          <div class="card-header">
            <h3>Volunteer Applications</h3>
          </div>
          <div class="list-content">
            <div v-for="volunteer in volunteers" :key="volunteer.VolunteerId" class="list-item volunteer-item" :class="{ 'status-approved': volunteer.Status === 'Approved', 'status-rejected': volunteer.Status === 'Rejected' }">
              <div class="volunteer-info">
                <div class="volunteer-name-section">
                  <h4>{{ volunteer.Name }}</h4>
                </div>
                <div class="volunteer-details">
                  <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ volunteer.Location }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">{{ volunteer.Phone }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ volunteer.Email }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Experience:</span>
                    <span class="detail-value">{{ volunteer.Experience || 'Not specified' }}</span>
                  </div>
                </div>
              </div>
              <div class="volunteer-actions">
                <button class="button button-success" :disabled="volunteer.Status === 'Approved'" @click="updateVolunteerStatus(volunteer.VolunteerId, 'Approved')">
                  Approve
                </button>
                <button class="button button-danger" :disabled="volunteer.Status === 'Rejected'" @click="updateVolunteerStatus(volunteer.VolunteerId, 'Rejected')">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Donations List -->
        <div class="content-card-donations">
          <div class="card-header">
            <h3>Recent Donations</h3>
          </div>
          <div class="list-content">
            <div v-for="donation in donations" :key="donation.DonationId" class="list-item donation-item">
              <div class="donation-info">
                <span class="donation-amount">${{ donation.Amount }}</span>
                <span class="donation-date">{{ formatDate(donation.CreatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Adoption Applications -->
        <div class="content-card-adoptions">
          <div class="card-header">
            <h3>Adoption Applications</h3>
            <button class="button button-secondary" @click="openHistoryModal('adoptions', 'Adoption History')">View All</button>
          </div>
          <div class="list-content">
            <div v-for="application in allAdoptions" :key="application.AdoptionFormId" class="list-item" :class="{ 'status-approved': application.Status === 'Approved', 'status-rejected': application.Status === 'Rejected' }">
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
                <button class="button button-success" :disabled="application.Status === 'Approved'" @click="updateAdoptionStatus(application.AdoptionFormId, 'Approved')">
                  Approve
                </button>
                <button class="button button-danger" :disabled="application.Status === 'Rejected'" @click="updateAdoptionStatus(application.AdoptionFormId, 'Rejected')">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports List -->
        <div class="content-card-reports">
          <div class="card-header">
            <h3>Stray Reports</h3>
          </div>
          <div class="list-content">
            <div v-for="report in allReports" :key="report.ReportId" class="list-item report-item">
              <div class="report-image-section">
                <div v-if="report.Images && report.Images.length > 0" class="image-gallery">
                  <img v-for="(image, index) in JSON.parse(report.Images)" :key="index" :src="image" alt="Report image" class="report-image" @click="openImage(image)">
                </div>
              </div>
              <div class="report-info">
                <div class="report-header">
                  <span class="report-location">{{ report.Location }}</span>
                  <span class="report-status" :class="report.Status.toLowerCase()">{{ report.Status }}</span>
                </div>
                <div class="report-details">
                  <p class="report-description">{{ report.Details }}</p>
                  <div v-if="report.Coordinates" class="coordinates">
                    <strong>Coordinates:</strong> {{ formatCoordinates(JSON.parse(report.Coordinates)) }}
                  </div>
                </div>
              </div>
              <div class="report-actions">
                <button v-if="report.Status.toLowerCase() === 'pending'" class="button button-success" @click="updateReportStatus(report.ReportId, 'Resolved')">
                  Resolve
                </button>
                <button v-else class="button button-danger" @click="deleteReport(report.ReportId)">
                  Delete
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
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to add dog')

      const newDog = await response.json()
      dogs.value.push(newDog)
      closeDogModal()
    } catch (error) {
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
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) throw new Error('Failed to delete dog')

    dogs.value = dogs.value.filter(dog => dog.AnimalId !== animalId)
  } catch (error) {
    // Handle error silently
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
    // Handle error silently
  }
}

// Adoption operations
async function updateAdoptionStatus(adoptionId, status) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/adoptions/${adoptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update adoption status: ${errorText}`);
    }

    // Update adoption in list
    const index = allAdoptions.value.findIndex(a => a.AdoptionFormId === adoptionId);
    if (index !== -1) {
      allAdoptions.value[index].Status = status;
    }
  } catch (error) {
    // Handle error silently
  }
}

// Report operations
async function updateReportStatus(reportId, status) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/reports/${reportId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Status: status })
    })

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update report status: ${errorText}`);
    }

    // Update report in list
    const index = allReports.value.findIndex(r => r.ReportId === reportId);
    if (index !== -1) {
      allReports.value[index].Status = status;
    }
  } catch (error) {
    // Handle error silently
  }
}

async function deleteReport(reportId) {
  if (!confirm('Are you sure you want to delete this report?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    // Handle expired token (401 Unauthorized)
    if (response.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete report: ${errorText}`);
    }

    // Remove report from list
    const index = allReports.value.findIndex(r => r.ReportId === reportId);
    if (index !== -1) {
      allReports.value.splice(index, 1);
    }
  } catch (error) {
    // Handle error silently
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
    error.value = 'Failed to load dogs. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function fetchVolunteers() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
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
    // Handle error silently
  }
}

async function fetchDonations() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
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
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    if (!response.ok) throw new Error('Failed to fetch donations')
    const data = await response.json()
    donations.value = data
  } catch (error) {
    // Handle error silently
  }
}

async function fetchReports() {
  try {
    const response = await fetch('http://localhost:5000/api/reports', {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('Failed to fetch reports')
    const data = await response.json()
    allReports.value = data
  } catch (error) {
    // Handle error silently
  }
}

async function fetchAdoptions() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    const response = await fetch('http://localhost:5000/api/adoptions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('Failed to fetch adoptions')
    const data = await response.json()
    allAdoptions.value = data
  } catch (error) {
    // Handle error silently
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
  fetchReports() // Always fetch reports
  
  // Only fetch admin data if user is admin
  if (isAdmin.value) {
    fetchAdoptions()
    fetchVolunteers()
    fetchDonations()
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
}

/* Enhanced Styling */
.dashboard-header {
  border-radius: 12px;
  box-shadow: none;
}

.dashboard-title {
  font-weight: 700;
}

.dashboard-user-name {
  font-weight: 600;
}

.dashboard-user-role {
  text-transform: capitalize;
}

.content-card {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3e2c8 100%);
  padding: 1.5rem;
}

.card-header h3 {
  font-size: 1.3rem;
  color: #333;
  font-weight: 600;
}

.list-content {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
}

.list-content::-webkit-scrollbar {
  width: 8px;
}

.list-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.list-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.list-item {
  padding: 1.25rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.list-item.status-approved {
  background-color: #e8f5e9;
  border-left: 4px solid #4CAF50;
  padding-left: 0.75rem;
  margin-left: -0.75rem;
}

.list-item.status-rejected {
  background-color: #ffebee;
  border-left: 4px solid #dc3545;
  padding-left: 0.75rem;
  margin-left: -0.75rem;
}

.dog-item {
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  align-items: start;
}

.dog-image {
  width: 100px;
  height: 100px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.dog-info h4 {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.dog-info p {
  font-size: 0.95rem;
}

.application-info h4,
.volunteer-info h4,
.report-info h4 {
  color: #333;
  font-weight: 600;
  font-size: 1rem;
}

.application-info p,
.volunteer-info p,
.report-info p {
  font-size: 0.85rem;
  margin: 0.3rem 0;
}

.contact-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #555;
  margin: 0.5rem 0;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.report-location {
  flex: 1;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
  min-width: 200px;
}

.report-status {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 0.5rem;
  white-space: nowrap;
  border: 1px solid transparent;
}

.status-badge.approved,
.status-badge.resolved {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.modal-content {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  border-bottom: 2px solid #f0f0f0;
}

.modal-header h2 {
  color: #333;
  font-size: 1.5rem;
}

.modal-close {
  color: #999;
  transition: all 0.2s ease;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-input-field {
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.button {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
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

/* Content Card Styles - Base */
.content-card-dogs,
.content-card-volunteers,
.content-card-donations,
.content-card-adoptions,
.content-card-reports {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 600px;
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

/* Donation Item Specific Styles */
.donation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e8f0f5;
}

.donation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1.5rem;
}

.donation-amount {
  font-size: 1.3rem;
  font-weight: 700;
  color: #27ae60;
  min-width: 100px;
}

.donation-date {
  font-size: 0.95rem;
  color: #7f8c8d;
  text-align: right;
  flex-grow: 1;
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

/* Improved Volunteer Item Layout */
.volunteer-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  background-color: #f9fbfc;
  border-left: 4px solid #667eea;
  border-radius: 6px;
}

.volunteer-item.status-approved {
  background-color: #f0f9f5;
  border-left-color: #27ae60;
}

.volunteer-item.status-rejected {
  background-color: #fef5f5;
  border-left-color: #e74c3c;
}

.volunteer-name-section {
  margin-bottom: 0.75rem;
}

.volunteer-name-section h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.volunteer-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 600;
  color: #555;
  min-width: 85px;
}

.detail-value {
  color: #777;
  word-break: break-word;
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

/* Report Item Specific Styles */
.report-item {
  display: grid !important;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 0.75rem 0 !important;
  border-bottom: 1px solid #f0f0f0 !important;
  background-color: transparent !important;
  border-left: none !important;
  margin: 0 !important;
  border-radius: 0;
}

.report-item:last-child {
  border-bottom: none !important;
}

.report-image-section {
  grid-column: 1;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.report-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.report-image:hover {
  transform: scale(1.05);
}

.report-info {
  grid-column: 2;
}

.report-header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.report-location {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.report-status {
  display: inline-block;
  width: fit-content;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: capitalize;
}

.report-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.report-status.resolved {
  background-color: #d4edda;
  color: #155724;
}

.report-description {
  margin: 0.3rem 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.3;
}

.coordinates {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.3rem;
}

.report-actions {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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

.button {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.button-primary {
  background-color: #4CAF50;
  color: white;
}

.button-secondary {
  background-color: #6c757d;
  color: white;
}

.button-edit {
  background-color: #ffc107;
  color: #333;
}

.button-delete {
  background-color: #dc3545;
  color: white;
}

.button-success {
  background-color: #28a745;
  color: white;
}

.button-success:disabled {
  background-color: #d4edda;
  color: #155724;
  cursor: not-allowed;
  opacity: 0.7;
}

.button-danger {
  background-color: #dc3545;
  color: white;
}

.button-danger:disabled {
  background-color: #f8d7da;
  color: #721c24;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>