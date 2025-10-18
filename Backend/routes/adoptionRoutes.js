import express from 'express';
import { createAdoption, getAdoptions, updateAdoptionStatus } from '../controllers/adoptionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';


const router = express.Router();

router.post('/animals/:id/adopt', createAdoption);
router.get('/adoptions', authenticateToken, getAdoptions);
router.patch('/adoptions/:id', authenticateToken, updateAdoptionStatus);

export default router;
