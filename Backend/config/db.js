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

export { sql, pool, query, modifySchema };
