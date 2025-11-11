import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import AuthRoutes from './routes/AuthRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import adoptionRoutes from './routes/adoptionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow frontend on different ports
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://192.168.100.32:8080', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
import fs from 'fs';
import path, { dirname } from 'path';
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
app.use('/api/volunteers', volunteerRoutes);
app.use('/api', adoptionRoutes); // This includes both /api/animals/:id/adopt and /api/adoptions routes
app.use('/api/reports', reportRoutes);
app.use('/api', paypalRoutes); // PayPal endpoints: /api/orders and /api/orders/:orderID/capture

// Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
