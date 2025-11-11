<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About Us</h3>
        <p>We are dedicated to helping stray dogs find loving homes and promoting responsible pet ownership in our community.</p>
      </div>

      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><router-link to="/adopt">Adopt a Dog</router-link></li>
          <li><router-link to="/donate">Make a Donation</router-link></li>
          <li><router-link to="/volunteer">Volunteer</router-link></li>
          <li><router-link to="/report">Report a Stray</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Contact Us</h3>
        <ul class="contact-info">
          <li>
            <i class="fas fa-map-marker-alt"></i>
            <span>Skopje, North Macedonia</span>
          </li>
          <li>
            <i class="fas fa-phone"></i>
            <span>+389 2 3245-678</span>
          </li>
          <li>
            <i class="fas fa-envelope"></i>
            <span>contact@straycare.mk</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Stray Care. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #333;
  color: #fff;
  padding: 5rem 2rem 2rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 4rem;
}

.footer-section h3 {
  color: #4CAF50;
  margin-bottom: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.footer-section:nth-child(1) {
  text-align: left;
}

.footer-section:nth-child(2) {
  text-align: center;
}

.footer-section:nth-child(3) {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-section p {
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 1rem;
}

.footer-section a {
  color: #fff;
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 500;
}

.footer-section a:hover {
  color: #4CAF50;
}

.contact-info li {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
  justify-content: flex-end;
}

.contact-info span {
  color: #ffffff;
  font-weight: 500;
}

.contact-info i {
  color: #4CAF50;
  font-size: 1.2rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-links a {
  color: #fff;
  font-size: 1.5rem;
  transition: color 0.2s;
}

.social-links a:hover {
  color: #4CAF50;
}

.footer-bottom {
  text-align: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(7, 7, 7, 0.1);
  font-size: 0.9rem;
  color: #999;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .contact-info li {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
