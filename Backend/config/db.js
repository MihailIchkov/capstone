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
      -- Check if Volunteers table exists
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Volunteers')
      BEGIN
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
          Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        )
      END
      ELSE
      BEGIN
        -- Add Status column if it doesn't exist
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Volunteers') AND name = 'Status')
        BEGIN
          ALTER TABLE Volunteers ADD Status NVARCHAR(50) NOT NULL DEFAULT 'Pending'
        END
        
        -- Add UpdatedAt column if it doesn't exist
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Volunteers') AND name = 'UpdatedAt')
        BEGIN
          ALTER TABLE Volunteers ADD UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
        END
      END

      -- Check if VolunteerSkills table exists
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VolunteerSkills')
      BEGIN
        -- Create VolunteerSkills table with correct schema
        CREATE TABLE VolunteerSkills (
          VolunteerSkillId INT IDENTITY(1,1) PRIMARY KEY,
          VolunteerId INT NOT NULL,
          Skill NVARCHAR(255) NOT NULL,
          FOREIGN KEY (VolunteerId) REFERENCES Volunteers(VolunteerId) ON DELETE CASCADE
        )
      END

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
