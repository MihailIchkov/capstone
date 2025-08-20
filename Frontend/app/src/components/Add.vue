<template>
  <div class="add-dog-form">
    <h2>Add a New Dog</h2>
    <form 
      enctype="multipart/form-data"
      @submit.prevent="submitDog"
    >
      <div class="form-group">
        <label for="name">
          Name:
        </label>
        <input
          id="name"
          v-model="dog.name"
          placeholder="Dog's name"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="breed">
          Breed:
        </label>
        <input
          id="breed"
          v-model="dog.breed"
          placeholder="Dog's breed"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="age">
          Age:
        </label>
        <input
          id="age"
          v-model="dog.age"
          type="number"
          min="0"
          placeholder="Age in years"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="image">
          Image:
        </label>
        <input
          id="image" 
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          required
          @change="handleImageSelect"
        >
        <div
          v-if="previewUrl"
          class="image-preview"
        >
          <img
            :src="previewUrl"
            alt="Preview"
          >
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Adding Dog...' : 'Add Dog' }}
      </button>
      
      <div
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref('')
const isSubmitting = ref(false)
const previewUrl = ref(null)
const selectedFile = ref(null)

const dog = ref({
  name: '',
  breed: '',
  age: null
})

function handleImageSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

async function submitDog() {
  if (!selectedFile.value) {
    error.value = 'Please select an image'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('name', dog.value.name)
    formData.append('breed', dog.value.breed)
    formData.append('age', dog.value.age)
    formData.append('image', selectedFile.value)

    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/animals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header when sending FormData,
        // browser will set it automatically with the correct boundary
      },
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to add dog')
    }

    // Success - redirect to home or dogs list
    router.push('/adopt')
  } catch (err) {
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

// Clean up preview URL when component is unmounted
onMounted(() => {
  return () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
  }
})
</script>

<style scoped>
.add-dog-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, button {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.image-preview {
  margin-top: 10px;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>