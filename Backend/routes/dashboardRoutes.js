import express from 'express';
import { authenticateToken as auth, requireAdmin } from '../middleware/auth.js';
import { pool, sql, modifySchema } from '../config/db.js';

const router = express.Router();

// Get dashboard data
router.get('/', auth, requireAdmin, async (req, res) => {
    try {
        const request = new sql.Request(pool);

        // Get admin info (Admins table)
        request.input('AdminID', sql.Int, req.user.AdminID);
        const userResult = await request.query(
            'SELECT AdminID, Username, Email, Role, CreatedAt FROM Admins WHERE AdminID = @AdminID'
        );
        const user = userResult.recordset[0];

        // Get recent dogs (last 5)
        const recentDogsResult = await request.query(
            'SELECT TOP 5 AnimalId, Name, Breed, Age, ImageUrl, Description FROM Animals ORDER BY AnimalId DESC'
        );
        const recentDogs = recentDogsResult.recordset;

        // Get total dogs count
        const totalDogsResult = await request.query(
            'SELECT COUNT(*) as count FROM Animals'
        );
        const totalDogs = totalDogsResult.recordset[0].count;

        // Get recent donations (last 5) - only if Donations table exists
        let recentDonations = [];
        let totalDonations = 0;
        try {
            const recentDonationsResult = await request.query(
                'SELECT TOP 5 * FROM Donations ORDER BY DonationId DESC'
            );
            recentDonations = recentDonationsResult.recordset;
            const totalDonationsResult = await request.query(
                'SELECT SUM(Amount) as total FROM Donations'
            );
            totalDonations = totalDonationsResult.recordset[0].total || 0;
        } catch (donErr) {
            // Donations table might not exist, skip if error
            recentDonations = [];
            totalDonations = 0;
        }

        // Get recent adoptions (last 5)
        let recentAdoptions = [];
        let totalAdoptions = 0;
        try {
            const recentAdoptionsResult = await request.query(
                'SELECT TOP 5 * FROM AdoptionForms ORDER BY AdoptionFormId DESC'
            );
            recentAdoptions = recentAdoptionsResult.recordset;
            const totalAdoptionsResult = await request.query(
                'SELECT COUNT(*) as count FROM AdoptionForms'
            );
            totalAdoptions = totalAdoptionsResult.recordset[0].count;
        } catch (adoptErr) {
            recentAdoptions = [];
            totalAdoptions = 0;
        }

        // Get recent volunteers (last 5)
        let latestVolunteers = [];
        try {
            const latestVolunteersResult = await request.query(
                'SELECT TOP 5 VolunteerId, Name, Email, Phone, Location FROM Volunteers ORDER BY VolunteerId DESC'
            );
            latestVolunteers = latestVolunteersResult.recordset;
        } catch (volErr) {
            latestVolunteers = [];
        }

        res.json({
            user,
            recentDogs,
            totalDogs,
            recentDonations,
            totalDonations,
            recentAdoptions,
            totalAdoptions,
            latestVolunteers,
            latestReports: [] // Initialize empty for now as it's not implemented
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin route to modify database schema
router.post('/schema/modify', auth, requireAdmin, async (req, res) => {
    try {
        // Check if user is admin (Admins table)
        const request = new sql.Request(pool);
        request.input('AdminID', sql.Int, req.user.AdminID);
        const userResult = await request.query(
            'SELECT Role FROM Admins WHERE AdminID = @AdminID'
        );
        if (!userResult.recordset[0] || userResult.recordset[0].Role !== 'admin') {
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
