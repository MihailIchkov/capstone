
import { pool, sql } from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllAnimals = async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query('SELECT * FROM Animals');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const getAnimalById = async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request(pool);
    const result = await request.query('SELECT * FROM Animals WHERE id = @id', {
      id: parseInt(id)
    });
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const createAnimal = async (req, res) => {
  try {
    const { name, breed, age } = req.body;
    let ImageUrl = '';

    // Validate required fields
    if (!name || !breed || !age) {
      return res.status(400).json({ error: 'Name, Breed and Age are required' });
    }
    
    // Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Handle image upload if file is provided
    if (req.file) {
      // Generate image URL based on file path
      ImageUrl = `/uploads/${req.file.filename}`;
    }

    const request = new sql.Request(pool);
    
    // Using parameterized query to prevent SQL injection
    const query = `
      INSERT INTO Animals (Name, Breed, Age, ImageUrl) 
      VALUES (@Name, @Breed, @Age, @ImageUrl)
    `;

    await request.input('Name', sql.NVarChar, name)
                .input('Breed', sql.NVarChar, breed)
                .input('Age', sql.Int, parseInt(age))
                .input('ImageUrl', sql.NVarChar, ImageUrl)
                .query(query);

    res.status(201).json({ 
      message: 'Animal created successfully',
      imageUrl: ImageUrl
    });
  } catch (err) {
    console.error('Error creating animal:', err);
    res.status(500).json({ error: err.message });
  }
}

export const updateAnimal = async (req, res) => {
  const { id } = req.params;
  const { Name, Breed, Age } = req.body;
  let ImageUrl = undefined;

  try {
    // Handle image upload if file is provided
    if (req.file) {
      ImageUrl = `/uploads/${req.file.filename}`;
    }

    const request = new sql.Request(pool);
    
    // Build dynamic update query based on provided fields
    let updateFields = [];
    if (Name) updateFields.push('Name = @Name');
    if (Breed) updateFields.push('Breed = @Breed');
    if (Age) updateFields.push('Age = @Age');
    if (ImageUrl) updateFields.push('ImageUrl = @ImageUrl');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE Animals 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;

    const updateRequest = request
      .input('id', sql.Int, parseInt(id));
    
    if (Name) updateRequest.input('Name', sql.NVarChar, Name);
    if (Breed) updateRequest.input('Breed', sql.NVarChar, Breed);
    if (Age) updateRequest.input('Age', sql.Int, parseInt(Age));
    if (ImageUrl) updateRequest.input('ImageUrl', sql.NVarChar, ImageUrl);

    const result = await updateRequest.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json({ 
      message: 'Animal updated successfully',
      imageUrl: ImageUrl
    });
  } catch (err) {
    console.error('Error updating animal:', err);
    res.status(500).json({ error: err.message });
  }
}

export const deleteAnimal = async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request(pool);
    
    // Using parameterized query for safety
    const result = await request
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM Animals WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json({ message: 'Animal deleted successfully' });
  } catch (err) {
    console.error('Error deleting animal:', err);
    res.status(500).json({ error: err.message });
  }
}
