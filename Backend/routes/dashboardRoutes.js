import express from 'express';
import { authenticateToken as auth } from '../middleware/auth.js';
import { pool, sql, modifySchema } from '../config/db.js';

const router = express.Router();

// Get dashboard data
router.get('/', auth, async (req, res) => {
    try {
        const request = new sql.Request(pool);

        // Get user info
        const userResult = await request.query(
            'SELECT id, email, name, role FROM Users WHERE id = @userId',
            {
                userId: req.user.id
            }
        );
        const user = userResult.recordset[0];

        // Get recent dogs (last 5)
        const recentDogsResult = await request.query(
            'SELECT TOP 5 id, Name, Breed, Age, ImageUrl, Description FROM Animals ORDER BY id DESC'
        );
        const recentDogs = recentDogsResult.recordset;

        // Get total dogs count
        const totalDogsResult = await request.query(
            'SELECT COUNT(*) as count FROM Animals'
        );
        const totalDogs = totalDogsResult.recordset[0].count;

        // Get recent donations (last 5)
        const recentDonationsResult = await request.query(
            'SELECT TOP 5 * FROM Donations ORDER BY id DESC'
        );
        const recentDonations = recentDonationsResult.recordset;

        // Calculate total donations
        const totalDonationsResult = await request.query(
            'SELECT SUM(amount) as total FROM Donations'
        );
        const totalDonations = totalDonationsResult.recordset[0].total || 0;

        res.json({
            user,
            recentDogs,
            totalDogs,
            recentDonations,
            totalDonations
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin route to modify database schema
router.post('/schema/modify', auth, async (req, res) => {
    try {
        // Check if user is admin
        const request = new sql.Request(pool);
        const userResult = await request.query(
            'SELECT role FROM Users WHERE id = @userId',
            {
                userId: req.user.id
            }
        );
        
        if (userResult.recordset[0].role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const success = await modifySchema('ALTER TABLE Animals DROP COLUMN AddedByAdminID');
        
        if (success) {
            res.json({ message: 'Schema modification successful' });
        } else {
            res.status(500).json({ error: 'Schema modification failed' });
        }
    } catch (error) {
        console.error('Schema modification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
