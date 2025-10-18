<template>
  <div class="donate-container">
    <h2>Support Our Shelter</h2>
    <p>Your donations help feed, shelter, and care for stray dogs.</p>
    
    <div 
      v-if="!isPayPalLoaded" 
      class="loading-message">
      Loading PayPal...
    </div>
    
    <div id="paypal-button-container"></div>
    
    <div 
      v-if="resultMsg"
      :class="['result-message', { success: isSuccess, error: !isSuccess }]">
      {{ resultMsg }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

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
  return new Promise((resolve) => {
    // Using sandbox client ID directly for testing
    const script = document.createElement('script')
    script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=MKD&components=buttons,payment-fields,marks'
    script.onload = () => {
      isPayPalLoaded.value = true
      resolve()
    }
    document.body.appendChild(script)
  })
}

// Initialize PayPal buttons
function initializePayPal() {
  if (!window.paypal) return

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
              throw new Error(err.error || 'Failed to create order')
            })
          }
          return response.json()
        })
        .then(orderData => {
          if (orderData.DonationId) {
            return orderData.DonationId
          }
          throw new Error('No order ID received')
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
    await loadPayPalScript()
    initializePayPal()
  } catch (error) {
    console.error('Failed to load PayPal:', error)
    showMessage('Failed to load PayPal. Please refresh the page.', false)
  }
})
</script>

<style scoped>
.donate-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

.loading-message {
  padding: 1rem;
  color: #666;
  font-style: italic;
}

.result-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.result-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.result-message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

#paypal-button-container {
  margin: 2rem auto;
  max-width: 750px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
</style>