// controllers/paypalController.js
import fetch from 'node-fetch';
import { pool, sql } from '../config/db.js';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'test';
const base = "https://api-m.sandbox.paypal.com";

// Helper to get access token
async function generateAccessToken() {
  try {
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
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate access token:", error);
    throw error;
  }
}

// Create PayPal order
export const createOrder = async (req, res) => {
  try {
    const cart = req.body.cart;
    if (!cart || !Array.isArray(cart) || !cart.length) {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    if (total <= 0) return res.status(400).json({ error: "Invalid donation amount" });

    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "MKD", value: total.toFixed(2) }, description: "Donation to Stray Care" }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    res.json(data);
  } catch (error) {
    console.error("Failed to create order:", error);
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

    res.json(data);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: error.message });
  }
};
