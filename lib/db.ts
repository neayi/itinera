import mysql from 'mysql2/promise';

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'itinera_user',
  password: process.env.DB_PASSWORD || 'itinera_password',
  database: process.env.DB_NAME || 'itinera_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Pool de connexions
let pool: mysql.Pool | null = null;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Helper pour exécuter une requête
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const connection = await getDbPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

// Helper pour exécuter une requête unique
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Test de connexion
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getDbPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
