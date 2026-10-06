import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let dbInstance: Database | null = null;
const dbDir = path.resolve(__dirname, '../../data');
const dbPath = path.resolve(dbDir, 'finova.db');

export async function initDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  SQL = await initSqlJs();

  let fileBuffer: Buffer | null = null;
  if (fs.existsSync(dbPath)) {
    try {
      fileBuffer = fs.readFileSync(dbPath);
    } catch (err) {
      console.warn('Could not read existing db file, initializing fresh:', err);
    }
  }

  if (fileBuffer && fileBuffer.length > 0) {
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
    persistDatabase();
  }

  return dbInstance;
}

export function persistDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

export function getDb(): Database {
  if (!dbInstance) {
    throw new Error('Database not initialized! Call initDatabase() first.');
  }
  return dbInstance;
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql: string, params: any[] = []): { changes: number } {
  const db = getDb();
  db.run(sql, params);
  persistDatabase();
  return { changes: db.getRowsModified() };
}

export function exec(sql: string): void {
  const db = getDb();
  db.exec(sql);
  persistDatabase();
}
