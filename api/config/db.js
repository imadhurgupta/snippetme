const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        picture     TEXT,
        created_at  BIGINT NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS snippets (
        id          TEXT PRIMARY KEY,
        title       TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        language    TEXT NOT NULL DEFAULT 'JavaScript',
        code        TEXT NOT NULL DEFAULT '',
        tags        TEXT NOT NULL DEFAULT '[]',
        project_id  TEXT NOT NULL DEFAULT '',
        user_id     TEXT NOT NULL,
        created_at  BIGINT NOT NULL,
        updated_at  BIGINT NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        color       TEXT NOT NULL DEFAULT '#6366f1',
        user_id     TEXT NOT NULL,
        created_at  BIGINT NOT NULL
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database', err);
  }
}

module.exports = { pool, initDb };
