require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Tables
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
initDb();

// Middleware
async function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // We now use standard JWT for both local and google logins
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
}

// Generate JWT Helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, picture: user.picture },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// --- AUTH ROUTES ---

// Verify current session
app.get('/api/auth/me', verifyUser, (req, res) => {
  res.json({ user: req.user });
});

// Google OAuth Login
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists
    let result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    let user;
    if (result.rows.length === 0) {
      const ts = Date.now();
      await pool.query(
        'INSERT INTO users (id, name, email, picture, created_at) VALUES ($1,$2,$3,$4,$5)',
        [googleId, name, email, picture, ts]
      );
      user = { id: googleId, email, name, picture };
    } else {
      user = result.rows[0];
      // Optionally update picture or name if changed
      if (user.picture !== picture) {
        await pool.query('UPDATE users SET picture=$1 WHERE id=$2', [picture, user.id]);
        user.picture = picture;
      }
    }
    const jwtToken = generateToken(user);
    res.json({ token: jwtToken, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google Token' });
  }
});

// Local Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  
  try {
    const check = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });
    
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    const ts = Date.now();
    
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1,$2,$3,$4,$5)',
      [id, name, email, hash, ts]
    );
    
    const user = { id, email, name, picture: null };
    res.json({ token: generateToken(user), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Local Login
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or name
  if (!identifier || !password) return res.status(400).json({ error: 'All fields required' });
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1 OR name=$2', [identifier, identifier]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    if (!user.password_hash) return res.status(401).json({ error: 'Please login with Google' });
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const userPayload = { id: user.id, email: user.email, name: user.name, picture: user.picture };
    res.json({ token: generateToken(userPayload), user: userPayload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API ROUTES ---

app.get('/api/snippets', verifyUser, async (req, res) => {
  const { projectId } = req.query;
  try {
    let result;
    if (projectId) {
      result = await pool.query('SELECT * FROM snippets WHERE user_id=$1 AND project_id=$2 ORDER BY created_at DESC', [req.user.id, projectId]);
    } else {
      result = await pool.query('SELECT * FROM snippets WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    }
    const snippets = result.rows.map(row => ({
      id: row.id, title: row.title, description: row.description, language: row.language, code: row.code,
      tags: JSON.parse(row.tags), projectId: row.project_id, userId: row.user_id, createdAt: row.created_at, updatedAt: row.updated_at
    }));
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/snippets', verifyUser, async (req, res) => {
  const { title, description, language, code, tags, projectId } = req.body;
  const id = crypto.randomUUID();
  const ts = Date.now();
  try {
    await pool.query(
      'INSERT INTO snippets (id,title,description,language,code,tags,project_id,user_id,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [id, title || '', description || '', language || 'JavaScript', code || '', JSON.stringify(tags || []), projectId || '', req.user.id, ts, ts]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/snippets/:id', verifyUser, async (req, res) => {
  const { title, description, language, code, tags, projectId } = req.body;
  try {
    await pool.query(
      'UPDATE snippets SET title=$1, description=$2, language=$3, code=$4, tags=$5, project_id=$6, updated_at=$7 WHERE id=$8 AND user_id=$9',
      [title || '', description || '', language || 'JavaScript', code || '', JSON.stringify(tags || []), projectId || '', Date.now(), req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/snippets/:id', verifyUser, async (req, res) => {
  try {
    await pool.query('DELETE FROM snippets WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects', verifyUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    const projects = result.rows.map(row => ({
      id: row.id, name: row.name, description: row.description, color: row.color, userId: row.user_id, createdAt: row.created_at
    }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', verifyUser, async (req, res) => {
  const { name, description, color } = req.body;
  const id = crypto.randomUUID();
  try {
    await pool.query(
      'INSERT INTO projects (id,name,description,color,user_id,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, name, description || '', color || '#6366f1', req.user.id, Date.now()]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', verifyUser, async (req, res) => {
  const { name, description, color } = req.body;
  try {
    await pool.query(
      'UPDATE projects SET name=$1, description=$2, color=$3 WHERE id=$4 AND user_id=$5',
      [name, description || '', color || '#6366f1', req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', verifyUser, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id/count', verifyUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM snippets WHERE user_id=$1 AND project_id=$2', [req.user.id, req.params.id]);
    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:userId', verifyUser, async (req, res) => {
  if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
  try {
    await pool.query('DELETE FROM snippets WHERE user_id=$1', [req.user.id]);
    await pool.query('DELETE FROM projects WHERE user_id=$1', [req.user.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
