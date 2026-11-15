import dotenv from 'dotenv';

dotenv.config();

export let pgPool: any = null;
let isPgConnected = false;

export async function checkPostgreSqlConnection(): Promise<boolean> {
  try {
    // Dynamic import allows the server to run smoothly even before `npm install pg` is run
    const pgModule = await import('pg').catch(() => null);
    if (!pgModule) {
      console.log('[PostgreSQL] "pg" driver package not detected. Using local JSON store (data/app-db.json). Run "npm i pg" to connect to a live PostgreSQL database.');
      return false;
    }

    const Pool = (pgModule.default && pgModule.default.Pool) ? pgModule.default.Pool : pgModule.Pool;
    const connectionString = process.env.DATABASE_URL;

    pgPool = connectionString
      ? new Pool({
          connectionString,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
            ? false
            : { rejectUnauthorized: false }
        })
      : new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'kisan_saathi_db',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 3000,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });

    const client = await pgPool.connect();
    const res = await client.query('SELECT NOW() AS server_time, current_database() AS db_name');
    client.release();
    isPgConnected = true;
    console.log(`[PostgreSQL] Connected successfully to database "${res.rows[0].db_name}" at ${res.rows[0].server_time}`);
    return true;
  } catch (err: any) {
    isPgConnected = false;
    console.warn(`[PostgreSQL] Database not reachable (${err.message}). Using local JSON fallback (data/app-db.json).`);
    return false;
  }
}

export function isConnectedToPg(): boolean {
  return isPgConnected;
}
