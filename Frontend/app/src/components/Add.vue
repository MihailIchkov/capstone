<!-- eslint-disable vue/html-self-closing, vue/html-closing-bracket-newline, vue/no-parsing-error, vue/singleline-html-element-content-newline, vue/first-attribute-linebreak, vue/max-attributes-per-line, vue/attributes-order -->
<template>
  <div class="content-card">
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
          class="form-input-field"
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
          class="form-input-field"
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
          class="form-input-field"
        >
      </div>
      
      <div class="form-group">
        <label for="description">
          Description:
        </label>
        <textarea
          id="description"
          v-model="dog.description"
          placeholder="Enter a description of the dog"
          rows="4"
          class="form-input-field"
        ></textarea>
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
          class="form-input-field"
        >
        <div class="image-guidelines">
          <p><strong>Recommended dimensions:</strong> 400x300px (4:3 ratio)</p>
          <p>This ensures optimal display on all devices</p>
        </div>
        <div
          v-if="previewUrl"
          class="image-preview-container"
        >
          <div class="preview-info">
            <p v-if="imageDimensions"><strong>Current size:</strong> {{ imageDimensions.width }}x{{ imageDimensions.height }}px</p>
            <button 
              v-if="canCrop"
              type="button"
              @click="autoCropImage"
              class="crop-button"
            >
              Auto Crop for Best Look
            </button>
          </div>
          <div class="image-preview">
            <img
              ref="previewImage"
              :src="previewUrl"
              alt="Preview"
              @load="onImageLoad"
            >
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="button"
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
const previewImage = ref(null)
const imageDimensions = ref(null)
const canCrop = ref(false)

const RECOMMENDED_WIDTH = 400
const RECOMMENDED_HEIGHT = 300
const ASPECT_RATIO = RECOMMENDED_WIDTH / RECOMMENDED_HEIGHT

const dog = ref({
  name: '',
  breed: '',
  age: null,
  description: ''
})

function onImageLoad() {
  if (previewImage.value) {
    imageDimensions.value = {
      width: previewImage.value.naturalWidth,
      height: previewImage.value.naturalHeight
    }
    // Check if image needs cropping (not in recommended ratio)
    const currentRatio = imageDimensions.value.width / imageDimensions.value.height
    canCrop.value = Math.abs(currentRatio - ASPECT_RATIO) > 0.1
  }
}

async function autoCropImage() {
  if (!selectedFile.value || !previewImage.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = previewImage.value

  const imgWidth = img.naturalWidth
  const imgHeight = img.naturalHeight
  const imgRatio = imgWidth / imgHeight

  let cropWidth, cropHeight

  if (imgRatio > ASPECT_RATIO) {
    // Image is wider than recommended - crop width
    cropHeight = imgHeight
    cropWidth = imgHeight * ASPECT_RATIO
  } else {
    // Image is taller than recommended - crop height
    cropWidth = imgWidth
    cropHeight = imgWidth / ASPECT_RATIO
  }

  const offsetX = (imgWidth - cropWidth) / 2
  const offsetY = (imgHeight - cropHeight) / 2

  canvas.width = RECOMMENDED_WIDTH
  canvas.height = RECOMMENDED_HEIGHT

  ctx.drawImage(
    img,
    offsetX,
    offsetY,
    cropWidth,
    cropHeight,
    0,
    0,
    RECOMMENDED_WIDTH,
    RECOMMENDED_HEIGHT
  )

  canvas.toBlob((blob) => {
    const croppedFile = new File([blob], selectedFile.value.name, { type: 'image/jpeg' })
    selectedFile.value = croppedFile
    previewUrl.value = canvas.toDataURL('image/jpeg')
    
    imageDimensions.value = {
      width: RECOMMENDED_WIDTH,
      height: RECOMMENDED_HEIGHT
    }
    canCrop.value = false
  }, 'image/jpeg', 0.95)
}

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
    formData.append('Name', dog.value.name)
    formData.append('Breed', dog.value.breed)
    formData.append('Age', dog.value.age)
    formData.append('Description', dog.value.description)
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

.image-guidelines {
  background-color: #e8f5e9;
  border-left: 4px solid #4CAF50;
  padding: 10px 12px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.image-guidelines p {
  margin: 5px 0;
  color: #2e7d32;
}

.image-preview-container {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.preview-info {
  margin-bottom: 15px;
}

.preview-info p {
  margin: 8px 0;
  color: #666;
  font-size: 0.9rem;
}

.crop-button {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  margin: 10px 0;
}

.crop-button:hover {
  background-color: #1976D2;
}

.image-preview {
  margin-top: 10px;
  max-width: 100%;
  display: flex;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>