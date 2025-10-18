import express from 'express';
import { createVolunteer, getVolunteers, getLatestVolunteers, updateVolunteerStatus } from '../controllers/volunteerController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createVolunteer);
router.get('/', authenticateToken, getVolunteers);
router.get('/latest', authenticateToken, getLatestVolunteers);
router.put('/:volunteerId/status', authenticateToken, requireAdmin, updateVolunteerStatus);

export default router;
