import sql from 'mssql';

const dbConfig = {
  server: process.env.DB_SERVER,
  port: 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 60000,
    enableArithAbort: true,
  },
};

const pool = await sql.connect(dbConfig);

async function query(sqlText, params = []) {
  const request = pool.request();

  const paramNames = sqlText.match(/@\w+/g) || [];

  paramNames.forEach((name, i) => {
    request.input(name.slice(1), sql.VarChar, params[i]);
  });

  return request.query(sqlText);
}

async function modifySchema(sqlCommand) {
  try {
    await pool.request().query(sqlCommand);
    console.log('Schema modification successful');
    return true;
  } catch (error) {
    console.error('Schema modification failed:', error);
    return false;
  }
}

// Function to ensure table structure
async function ensureTableStructure() {
  try {
    const result = await pool.request().query(`
      -- Drop existing tables if they exist to ensure clean schema
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VolunteerSkills')
      BEGIN
        DROP TABLE VolunteerSkills
      END

      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Volunteers')
      BEGIN
        DROP TABLE Volunteers
      END

      -- Create Volunteers table with correct schema
      CREATE TABLE Volunteers (
        VolunteerId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Phone NVARCHAR(50) NOT NULL,
        Location NVARCHAR(255) NOT NULL,
        Availability NVARCHAR(50) NOT NULL,
        Experience NVARCHAR(MAX),
        Reason NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE()
      )

      -- Create VolunteerSkills table with correct schema
      CREATE TABLE VolunteerSkills (
        VolunteerSkillId INT IDENTITY(1,1) PRIMARY KEY,
        VolunteerId INT NOT NULL,
        Skill NVARCHAR(255) NOT NULL,
        FOREIGN KEY (VolunteerId) REFERENCES Volunteers(VolunteerId) ON DELETE CASCADE
      )

      -- Update schema if needed
      IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Volunteers') AND name = 'Address')
      BEGIN
        EXEC sp_rename 'Volunteers.Address', 'Location', 'COLUMN'
      END

      -- Remove old VolunteerSkills column if it exists
      IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Volunteers') AND name = 'VolunteerSkills')
      BEGIN
        ALTER TABLE Volunteers DROP COLUMN VolunteerSkills
      END
    `);
    console.log('Table structure verified/updated successfully');
    return true;
  } catch (error) {
    console.error('Error ensuring table structure:', error);
    return false;
  }
}

// Call ensureTableStructure when the module loads
ensureTableStructure().catch(console.error);

export { sql, pool, query, modifySchema };
