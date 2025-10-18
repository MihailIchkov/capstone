import { pool, sql } from '../config/db.js';

// Create a new adoption form entry
export const createAdoption = async (req, res) => {
  try {
    const {
      AnimalId, Name, Email, Phone, Address,
      HasPets, ExistingPets, HomeType, HasYard,
      WorkSchedule, Experience, Status
    } = req.body;

    const request = new sql.Request(pool);
    request.input('AnimalId', sql.Int, AnimalId);
    request.input('Name', sql.NVarChar, Name);
    request.input('Email', sql.NVarChar, Email);
    request.input('Phone', sql.NVarChar, Phone);
    request.input('Address', sql.NVarChar, Address);
    request.input('HasPets', sql.Bit, HasPets);
    request.input('ExistingPets', sql.NVarChar, ExistingPets);
    request.input('HomeType', sql.NVarChar, HomeType);
    request.input('HasYard', sql.Bit, HasYard);
    request.input('WorkSchedule', sql.NVarChar, WorkSchedule);
    request.input('Experience', sql.NVarChar, Experience);
    request.input('Status', sql.NVarChar, Status);

    await request.query(`
      INSERT INTO AdoptionForms (
        AnimalId, Name, Email, Phone, Address, HasPets, ExistingPets, HomeType, HasYard, WorkSchedule, Experience, Status
      ) VALUES (
        @AnimalId, @Name, @Email, @Phone, @Address, @HasPets, @ExistingPets, @HomeType, @HasYard, @WorkSchedule, @Experience, @Status
      )
    `);

    res.status(201).json({ message: 'Adoption form submitted!' });
  } catch (error) {
    console.error('Adoption form error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all adoptions
export const getAdoptions = async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query('SELECT * FROM AdoptionForms ORDER BY AdoptionFormId DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update adoption status
export const updateAdoptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const request = new sql.Request(pool);
    request.input('AdoptionFormId', sql.Int, id);
    request.input('Status', sql.NVarChar, status);
    const result = await request.query('UPDATE AdoptionForms SET Status = @Status WHERE AdoptionFormId = @AdoptionFormId');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Adoption request not found' });
    }
    res.json({ message: 'Adoption status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
