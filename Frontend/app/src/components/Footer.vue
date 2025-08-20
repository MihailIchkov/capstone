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
          <li><router-link to="/Adopt">Adopt a Dog</router-link></li>
          <li><router-link to="/Donate">Make a Donation</router-link></li>
          <li><router-link to="/Report">Report a Stray</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Contact Us</h3>
        <ul class="contact-info">
          <li>
            <i class="fas fa-map-marker-alt"></i>
            <span>123 Shelter Street<br>City, State 12345</span>
          </li>
          <li>
            <i class="fas fa-phone"></i>
            <span>(123) 456-7890</span>
          </li>
          <li>
            <i class="fas fa-envelope"></i>
            <span>info@straycare.org</span>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Follow Us</h3>
        <div class="social-links">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-facebook"></i>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-twitter"></i>
          </a>
        </div>
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
  padding: 4rem 2rem 1rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3 {
  color: #4CAF50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.8rem;
}

.footer-section a {
  color: #fff;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: #4CAF50;
}

.contact-info li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.contact-info i {
  color: #4CAF50;
  font-size: 1.2rem;
  margin-top: 0.2rem;
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
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
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