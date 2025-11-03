import { pool, sql } from '../config/db.js';

// Create a new report
export const createReport = async (req, res) => {
  try {
    const {
      AnimalId,
      ReportType,
      Description,
      Location
    } = req.body;

    // Basic validation
    if (!AnimalId || !ReportType || !Description) {
      return res.status(400).json({ error: 'AnimalId, ReportType, and Description are required.' });
    }

    const request = new sql.Request(pool);
    request.input('AnimalId', sql.Int, AnimalId);
    request.input('ReportType', sql.NVarChar, ReportType);
    request.input('Description', sql.NVarChar, Description);
    request.input('Location', sql.NVarChar, Location);
    request.input('Status', sql.NVarChar, 'Pending'); // Default status

    await request.query(`
      INSERT INTO Reports (AnimalId, ReportType, Description, Location, Status, CreatedAt)
      VALUES (@AnimalId, @ReportType, @Description, @Location, @Status, GETDATE())
    `);

    res.status(201).json({ message: 'Report submitted successfully!' });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all reports
export const getReports = async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query(`
        SELECT 
            r.ReportId,
            r.ReportType,
            r.Description,
            r.Location,
            r.Status,
            r.CreatedAt,
            a.Name as AnimalName,
            a.ImageUrl as AnimalImage
        FROM Reports r
        JOIN Animals a ON r.AnimalId = a.AnimalId
        ORDER BY r.ReportId DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
    }

    const request = new sql.Request(pool);
    request.input('ReportId', sql.Int, id);
    request.input('Status', sql.NVarChar, status);

    const result = await request.query('UPDATE Reports SET Status = @Status WHERE ReportId = @ReportId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: error.message });
  }
};
