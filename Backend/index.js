import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import AuthRoutes from './routes/AuthRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from '@paypal/paypal-server-sdk';

const app = express();
const PORT = process.env.PORT || 5000;

// Autentikacija
app.use(cors({
  origin: ['http://localhost:8080', 'http://192.168.100.32:8080', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/animals', animalRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/dashboard', dashboardRoutes);


// PayPal Pocetok
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox, // Sandbox for testing
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);

// Helper Functions
const createOrder = async (cart = []) => {
  // Calculate total from cart
  const total = cart.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2);
  
  if (total <= 0) {
    throw new Error('Invalid donation amount');
  }

  const request = {
    body: {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: total,
          },
          description: "Donation to Stray Care"
        },
      ],
    },
    prefer: "return=representation",
  };

  try {
    const { body, ...httpResponse } = await ordersController.createOrder(request);
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

const captureOrder = async (orderID) => {
  const request = {
    id: orderID,
    prefer: "return=representation",
  };

  try {
    const { body, ...httpResponse } = await ordersController.captureOrder(request);
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

// PayPal Routes
app.post('/api/orders', async (req, res) => {
  try {
    const { cart } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

app.post('/api/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: 'Failed to capture order.' });
  }
});//Paypal Kraj

// Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
