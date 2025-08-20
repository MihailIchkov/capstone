<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/html-self-closing -->
<template>
  <Map
    :center="{ lat: 41.9981, lng: 21.4254 }"
    :zoom="13"
    style="width: 100%; height: 400px"
    map-type-id="roadmap"
    :googlemaps="{
      styles: []
    }"
  >
    <Marker :position="{ lat: 41.9981, lng: 21.4254 }" />
  </Map>

  <Layout>
    <h2>Report a Stray Dog</h2>
    <form @submit.prevent="submitReport">
      <input v-model="report.location" placeholder="Location" required />
      <textarea v-model="report.details" placeholder="Details" required></textarea>
      <button type="submit">Submit Report</button>
    </form>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
import { Map } from '@fawmi/vue-google-maps'

const report = ref({
  location: '',
  details: ''
})

function submitReport() {
  // POST to backend
  console.log('Report submitted:', report.value)
}
</script>