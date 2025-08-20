import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { registerController, loginController, dashboardController } from '../controllers/AuthController.js';

const router = express.Router();

// Admini
router.post('/register', authenticateToken, requireAdmin, registerController);
router.post('/login', loginController);
router.get('/dashboard', authenticateToken, requireAdmin, dashboardController);

export default router;