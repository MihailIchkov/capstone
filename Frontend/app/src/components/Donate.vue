<template>
  <div class="donate-container">
    <h2>Support Our Shelter</h2>
    <p>Your donations help feed, shelter, and care for stray dogs.</p>
    
    <div 
      v-if="!isPayPalLoaded" 
      class="loading-message">
      Loading PayPal...
    </div>
    
    <!-- PayPal button container - always in DOM -->
    <div id="paypal-button-container"></div>
    
    <div 
      v-if="resultMsg"
      :class="['result-message', { success: isSuccess, error: !isSuccess }]">
      {{ resultMsg }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'

// State
const isPayPalLoaded = ref(false)
const selectedAmount = ref(100)
const resultMsg = ref('')
const isSuccess = ref(false)

// Handle result message
function showMessage(message, success = true) {
  resultMsg.value = message
  isSuccess.value = success
}

// Load PayPal SDK
function loadPayPalScript() {
  return new Promise((resolve, reject) => {
    // Check if PayPal is already loaded
    if (window.paypal) {
      isPayPalLoaded.value = true
      resolve()
      return
    }

    // Check if script already exists
    const existingScript = document.getElementById('paypal-sdk-script')
    if (existingScript) {
      // Wait for it to load
      let attempts = 0
      const checkReady = setInterval(() => {
        attempts++
        if (window.paypal) {
          clearInterval(checkReady)
          isPayPalLoaded.value = true
          resolve()
        } else if (attempts > 100) { // 10 second timeout
          clearInterval(checkReady)
          reject(new Error('PayPal SDK took too long to load'))
        }
      }, 100)
      return
    }

    const clientId = process.env.VUE_APP_PAYPAL_CLIENT_ID
    if (!clientId) {
      reject(new Error('PayPal Client ID is not configured'))
      return
    }

    const script = document.createElement('script')
    script.id = 'paypal-sdk-script'
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons,payment-fields,marks&disable-funding=credit,card`
    
    script.onload = () => {
      // Wait for paypal object to be available
      let attempts = 0
      const checkReady = setInterval(() => {
        attempts++
        if (window.paypal) {
          clearInterval(checkReady)
          isPayPalLoaded.value = true
          resolve()
        } else if (attempts > 50) { // 5 second timeout
          clearInterval(checkReady)
          reject(new Error('PayPal object not available after script load'))
        }
      }, 100)
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load PayPal SDK'))
    }
    
    document.body.appendChild(script)
  })
}

// Initialize PayPal buttons
function initializePayPal() {
  if (!window.paypal) {
    console.error('PayPal SDK not loaded')
    showMessage('PayPal SDK failed to load', false)
    return
  }

  const container = document.getElementById('paypal-button-container')
  if (!container) {
    console.error('PayPal container not found in DOM')
    showMessage('PayPal container not found', false)
    return
  }

  // Clear any previous content
  container.innerHTML = ''

  window.paypal
    .Buttons({
      style: {
        shape: 'rect',
        layout: 'horizontal',
        color: 'gold',
        label: 'paypal',
        tagline: false
      },
      components: 'buttons,payment-fields,marks',
      createOrder() {
        return fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            cart: [{
              id: 'DONATION',
              amount: selectedAmount.value
            }]
          })
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              const errorMsg = err.error || `HTTP ${response.status}: Failed to create order`
              console.error('Backend error response:', err)
              throw new Error(errorMsg)
            }).catch(parseError => {
              console.error('Could not parse error response:', parseError)
              throw new Error(`HTTP ${response.status}: Failed to create order`)
            })
          }
          return response.json()
        })
        .then(orderData => {
          console.log('Full order data received from backend:', orderData)
          console.log('Available fields in response:', Object.keys(orderData))
          
          // Try multiple field names for order ID
          const orderId = orderData.DonationId || orderData.id || orderData.OrderId
          if (!orderId) {
            console.error('ERROR: No order ID found in response')
            console.error('Available fields:', Object.keys(orderData))
            console.error('Full response:', orderData)
            throw new Error('No order ID received from server')
          }
          
          console.log('Successfully extracted order ID:', orderId)
          return orderId
        })
        .catch(error => {
          console.error('Create order error:', error)
          showMessage('Could not initiate PayPal Checkout: ' + error.message, false)
          throw error
        })
      },
      onApprove(data) {
        return fetch(`http://localhost:5000/api/orders/${data.orderID}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.error || 'Failed to capture order')
            })
          }
          return response.json()
        })
        .then(orderData => {
          console.log('Capture successful:', orderData)
          const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0]
          if (transaction) {
            showMessage(`Thank you for your donation of $${selectedAmount.value}! Transaction ID: ${transaction.TransactionId}`, true)
          } else {
            throw new Error('No transaction details found')
          }
        })
        .catch(error => {
          console.error('Capture error:', error)
          showMessage('Sorry, your donation could not be processed: ' + error.message, false)
          throw error
        })
      },
      onError(error) {
        console.error(error)
        showMessage('PayPal encountered an error. Please try again.', false)
      }
    })
    .render('#paypal-button-container')
}

// Component mounted
onMounted(async () => {
  try {
    // First load the PayPal script
    await loadPayPalScript()
    
    // Wait for DOM to be fully updated
    await nextTick()
    
    // Additional delay for browser rendering
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verify container exists before initializing
    const container = document.getElementById('paypal-button-container')
    if (!container) {
      throw new Error('PayPal button container not found in DOM after mounting')
    }
    
    // Initialize PayPal buttons
    initializePayPal()
  } catch (error) {
    console.error('Failed to load PayPal:', error)
    showMessage('Failed to load PayPal. Please refresh the page.', false)
  }
})
</script>

<style scoped>
.donate-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 600;
}

.donate-container > p {
  color: #555;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.loading-message {
  padding: 1.5rem;
  color: #7f8c8d;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.result-message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.result-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #28a745;
}

.result-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

#paypal-button-container {
  margin: 2.5rem auto;
  max-width: 750px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Ensure payment fields align properly */
.paypal-buttons {
  width: 100% !important;
  max-width: 750px !important;
}

/* Force left alignment for payment fields */
.paymentFieldsWrapper {
  margin-left: 0 !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .donate-container {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  #paypal-button-container {
    max-width: 100%;
  }
}
</style>