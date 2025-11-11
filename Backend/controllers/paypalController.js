// controllers/paypalController.js
import fetch from 'node-fetch';
import { pool, sql } from '../config/db.js';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'test';
const base = "https://api-m.sandbox.paypal.com";

// Helper to get access token
async function generateAccessToken() {
  try {
    console.log('Generating access token with ClientID:', PAYPAL_CLIENT_ID.substring(0, 10) + '...');
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();
    if (!data.access_token) {
      console.error('Failed to get access token. Response:', data);
      throw new Error('No access token in response: ' + JSON.stringify(data));
    }
    console.log('Access token generated successfully');
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate access token:", error.message);
    throw error;
  }
}

// Create PayPal order
export const createOrder = async (req, res) => {
  try {
    const cart = req.body.cart;
    console.log('Create order request received with cart:', cart);
    
    if (!cart || !Array.isArray(cart) || !cart.length) {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    console.log('Total amount to charge:', total);
    
    if (total <= 0) return res.status(400).json({ error: "Invalid donation amount" });

    const accessToken = await generateAccessToken();
    console.log('Access token generated successfully');
    
    // Ensure amount is a proper number with 2 decimal places
    const amount = parseFloat(total).toFixed(2);
    console.log('Formatted amount:', amount);
    
    const requestBody = {
      intent: "CAPTURE",
      purchase_units: [{ 
        amount: { 
          currency_code: "USD",  // Using USD for testing - MKD may not be supported
          value: amount
        }, 
        description: "Donation to Stray Care" 
      }],
      application_context: {
        brand_name: "Stray Care",
        user_action: "PAY_NOW",
        locale: "en-US",
        return_url: "http://localhost:3000/donate",
        cancel_url: "http://localhost:3000/donate"
      }
    };
    
    console.log('Sending to PayPal:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('PayPal HTTP Status:', response.status);
    console.log('PayPal response:', JSON.stringify(data, null, 2));
    
    if (data.name && data.name !== 'CREATED') {
      console.error('PayPal API error:', data.name, data.message);
      console.error('PayPal error details:', JSON.stringify(data.details || {}, null, 2));
      throw new Error(`PayPal API Error: ${data.message || data.name}`);
    }

    if (!data.id) {
      console.error('No order ID in PayPal response. Full response:', data);
      throw new Error('PayPal did not return an order ID');
    }

    console.log('Order created successfully with ID:', data.id);
    
    res.json({
      ...data,
      DonationId: data.id
    });
  } catch (error) {
    console.error("Failed to create order:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal order
export const captureOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const accessToken = await generateAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // Save donation to database
    const transaction = data.purchase_units[0].payments.captures[0];
    const request = new sql.Request(pool);
    
    await request
      .input('Amount', sql.Decimal(10, 2), parseFloat(transaction.amount.value))
      .input('TransactionId', sql.NVarChar, transaction.id)
      .input('AdminId', sql.Int, req.user ? req.user.AdminID : null)
      .query(`
        INSERT INTO Donations (Amount, TransactionId, AdminId, CreatedAt)
        VALUES (@Amount, @TransactionId, @AdminId, GETDATE())
      `);

    res.json({
      ...data,
      TransactionId: transaction.id
    });
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: error.message });
  }
};
