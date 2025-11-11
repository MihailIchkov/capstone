import express from 'express';
import sql from 'mssql';
import { pool } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { Location, Details, Coordinates, Images } = req.body;
    const request = new sql.Request(pool);

    const result = await request
      .input('Location', sql.NVarChar, Location)
      .input('Details', sql.NVarChar, Details)
      .input('Coordinates', sql.NVarChar, JSON.stringify(Coordinates))
      .input('Images', sql.NVarChar, JSON.stringify(Images))
      .input('Status', sql.NVarChar, 'Pending')
      .query(`
        INSERT INTO Reports (Location, Details, Coordinates, Images, Status, CreatedAt)
        VALUES (@Location, @Details, @Coordinates, @Images, @Status, GETDATE())
      `);

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.get('/', async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query(`
      SELECT ReportId, Location, Details, Coordinates, Images, Status, CreatedAt
      FROM Reports
      ORDER BY CreatedAt DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;
    const request = new sql.Request(pool);

    const result = await request
      .input('ReportId', sql.Int, id)
      .input('Status', sql.NVarChar, Status)
      .query(`
        UPDATE Reports
        SET Status = @Status
        WHERE ReportId = @ReportId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const request = new sql.Request(pool);

    const result = await request
      .input('ReportId', sql.Int, id)
      .query(`
        DELETE FROM Reports
        WHERE ReportId = @ReportId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
