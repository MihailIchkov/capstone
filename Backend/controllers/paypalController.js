const fetch = require('node-fetch');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'test';
const base = "https://api-m.sandbox.paypal.com";

// Helper to get access token
async function generateAccessToken() {
  try {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
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
exports.createOrder = async (req, res) => {
  try {
    const cart = req.body.cart;
    if (!cart || !Array.isArray(cart) || !cart.length) {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    if (total <= 0) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
            },
            description: "Donation to Stray Care"
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return res.json(data);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal order
exports.captureOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

        // Save donation to database
    const transaction = data.purchase_units[0].payments.captures[0];
    const donation = new Donation({
      amount: parseFloat(transaction.amount.value),
      transactionId: transaction.id,
      user: req.user ? req.user.id : null
    });
    await donation.save();

    return res.json(data);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: error.message });
  }
};
