import { pool, sql } from "../config/db.js";

const handleVolunteerSkills = async (volunteerId, skills, request) => {
  if (Array.isArray(skills) && skills.length > 0) {
    const params = skills.map((skill, index) => {
      request.input(`skill${index}`, sql.NVarChar, skill);
      return `(@volunteerId, @skill${index})`;
    });

    request.input("volunteerId", sql.Int, volunteerId);
    await request.query(`
      INSERT INTO VolunteerSkills (VolunteerId, Skill)
      VALUES ${params.join(",")}
    `);
  }
};

export const createVolunteer = async (req, res) => {
  let transaction = null;

  try {
    const {
      Name, Email, Phone, Location, Skills = [], Availability, Experience, Reason
    } = req.body;

    if (!Name || !Email || !Phone || !Location || !Availability || !Reason) {
      return res.status(400).json({
        error: "Required fields missing",
        details: {
          Name: !Name,
          Email: !Email,
          Phone: !Phone,
          Location: !Location,
          Availability: !Availability,
          Reason: !Reason
        }
      });
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    request.input("Name", sql.NVarChar, Name);
    request.input("Email", sql.NVarChar, Email);
    request.input("Phone", sql.NVarChar, Phone);
    request.input("Location", sql.NVarChar, Location);
    request.input("Availability", sql.NVarChar, Availability);
    request.input("Experience", sql.NVarChar, Experience || "");
    request.input("Reason", sql.NVarChar, Reason);

    const result = await request.query(`
      INSERT INTO Volunteers (
        Name, Email, Phone, Location, Availability, Experience, Reason
      )
      OUTPUT INSERTED.VolunteerId
      VALUES (
        @Name, @Email, @Phone, @Location, @Availability, @Experience, @Reason
      )
    `);

    const volunteerId = result.recordset[0].VolunteerId;
    await handleVolunteerSkills(volunteerId, Skills, request);
    await transaction.commit();

    res.status(201).json({ message: "Volunteer form submitted!" });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }
    console.error("Volunteer form error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getVolunteers = async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query(`
      SELECT 
        VolunteerId,
        Name,
        Email,
        Phone,
        Location,
        Availability,
        Experience,
        Reason,
        COALESCE(Status, 'Pending') as Status
      FROM Volunteers 
      ORDER BY VolunteerId DESC
    `);
    console.log('Volunteers query result:', result.recordset);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error in getVolunteers:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { status } = req.body;

    if (!volunteerId || !status) {
      return res.status(400).json({ error: 'Volunteer ID and status are required' });
    }

    const request = new sql.Request(pool);
    const result = await request
      .input('volunteerId', sql.Int, parseInt(volunteerId))
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Volunteers
        SET Status = @status
        WHERE VolunteerId = @volunteerId;
        
        SELECT * FROM Volunteers WHERE VolunteerId = @volunteerId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getLatestVolunteers = async (req, res) => {
  try {
    const request = new sql.Request(pool);
    const result = await request.query(`
      SELECT TOP 5
        v.*,
        STRING_AGG(vs.Skill, ", ") as Skills
      FROM Volunteers v
      LEFT JOIN VolunteerSkills vs ON v.VolunteerId = vs.VolunteerId
      GROUP BY
        v.VolunteerId, v.Name, v.Email, v.Phone, v.Location,
        v.Availability, v.Experience, v.Reason
      ORDER BY v.VolunteerId DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
