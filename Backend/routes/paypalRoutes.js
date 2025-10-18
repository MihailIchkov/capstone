import express from 'express';
import paypalController from '../controllers/paypalController.js';
import { authenticateToken } from '../middleware/auth.js';
import { pool, sql } from '../config/db.js';

const router = express.Router();

// Create PayPal order
router.post('/orders', paypalController.createOrder);

// Capture PayPal order
router.post('/orders/:orderID/capture', paypalController.captureOrder);

// Get all donations (admin only)
router.get('/donations', authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query(`
      SELECT 
        d.*,
        ISNULL(a.Username, 'Online Donation') as Source
      FROM Donations d
      LEFT JOIN Admins a ON d.AdminId = a.AdminID
      ORDER BY d.CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
