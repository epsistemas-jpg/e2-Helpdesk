const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT || 5432),
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

function translateSql(sql) {
  let index = 0;
  let translated = sql.replace(/\?/g, () => `$${++index}`);
  translated = translated.replace(/FIELD\(t\.priority,\s*'urgente','alta','media','baja'\)/gi,
    "CASE t.priority WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 ELSE 5 END");
  translated = translated.replace(/t\.id LIKE \$([0-9]+)/gi, (_, number) => `CAST(t.id AS TEXT) LIKE $${number}`);
  translated = translated.replace(/DATE_SUB\(NOW\(\), INTERVAL 7 DAY\)/gi, "NOW() - INTERVAL '7 days'");
  translated = translated.replace(/DATE_SUB\(NOW\(\), INTERVAL 30 DAY\)/gi, "NOW() - INTERVAL '30 days'");
  translated = translated.replace(/DATE_SUB\(NOW\(\), INTERVAL 365 DAY\)/gi, "NOW() - INTERVAL '365 days'");
  translated = translated.replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP');
  return translated;
}

async function query(sql, values = []) {
  let statement = translateSql(sql);
  const isInsert = /^\s*INSERT\s+INTO\s+/i.test(statement) && !/\bRETURNING\b/i.test(statement);
  if (isInsert) statement = `${statement.trim().replace(/;$/, '')} RETURNING id`;
  const result = await pool.query(statement, values);
  // Mantener la forma de respuesta que usaba mysql2: varios controladores
  // leen `result.insertId` o `result.affectedRows` del primer elemento.
  // En pg, las filas vienen como un array, así que adjuntamos esos metadatos
  // al mismo array sin romper los SELECT existentes (`const [rows] = ...`).
  const rows = result.rows || [];
  rows.insertId = rows[0]?.id;
  rows.affectedRows = result.rowCount;
  return [rows, { insertId: rows.insertId, affectedRows: rows.affectedRows }];
}

module.exports = { query, end: () => pool.end() };
