import initSqlJs from 'sql.js';

// ─── Config ──────────────────────────────────────────────────────────────────
const DB_KEY  = process.env.REACT_APP_DATABASE_LOCAL_STORAGE_KEY || 'snippetflow_sqlite_v1';

let _db  = null;
let _SQL = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
export const getDB = async () => {
  if (_db) return _db;

  _SQL = await initSqlJs({ 
    locateFile: file => `/${file}` 
  });

  const stored = localStorage.getItem(DB_KEY);
  _db = stored
    ? new _SQL.Database(new Uint8Array(JSON.parse(stored)))
    : new _SQL.Database();

  _db.run(`
    CREATE TABLE IF NOT EXISTS snippets (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      language    TEXT NOT NULL DEFAULT 'JavaScript',
      code        TEXT NOT NULL DEFAULT '',
      tags        TEXT NOT NULL DEFAULT '[]',
      project_id  TEXT NOT NULL DEFAULT '',
      user_id     TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      color       TEXT NOT NULL DEFAULT '#6366f1',
      user_id     TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    );
  `);

  persist();
  return _db;
};

// ─── Persistence ──────────────────────────────────────────────────────────────
export const persist = () => {
  if (!_db) return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(Array.from(_db.export())));
  } catch {
    console.warn('sqlite: localStorage quota exceeded');
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);

const now = () => Date.now();

const toRows = (results) => {
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
};

const mapSnippet = (row) => ({
  id:          row.id,
  title:       row.title,
  description: row.description,
  language:    row.language,
  code:        row.code,
  tags:        JSON.parse(row.tags || '[]'),
  projectId:   row.project_id,
  userId:      row.user_id,
  createdAt:   row.created_at,
  updatedAt:   row.updated_at,
});

const mapProject = (row) => ({
  id:          row.id,
  name:        row.name,
  description: row.description,
  color:       row.color,
  userId:      row.user_id,
  createdAt:   row.created_at,
});

// ─── Snippets ─────────────────────────────────────────────────────────────────
export const getSnippets = async (userId, projectId = null) => {
  const db = await getDB();
  const results = projectId
    ? db.exec(`SELECT * FROM snippets WHERE user_id=? AND project_id=? ORDER BY created_at DESC`, [userId, projectId])
    : db.exec(`SELECT * FROM snippets WHERE user_id=? ORDER BY created_at DESC`, [userId]);
  return toRows(results).map(mapSnippet);
};

export const getSnippet = async (id) => {
  const db = await getDB();
  const results = db.exec(`SELECT * FROM snippets WHERE id=?`, [id]);
  const rows = toRows(results);
  return rows.length ? mapSnippet(rows[0]) : null;
};

export const addSnippet = async (data) => {
  const db = await getDB();
  const id = uid();
  const ts = now();
  db.run(
    `INSERT INTO snippets (id,title,description,language,code,tags,project_id,user_id,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      data.title        || '',
      data.description  || '',
      data.language     || 'JavaScript',
      data.code         || '',
      JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
      data.projectId    || '',
      data.userId,
      ts, ts,
    ]
  );
  persist();
  return id;
};

export const updateSnippet = async (id, data) => {
  const db = await getDB();
  db.run(
    `UPDATE snippets SET title=?,description=?,language=?,code=?,tags=?,project_id=?,updated_at=? WHERE id=?`,
    [
      data.title        || '',
      data.description  || '',
      data.language     || 'JavaScript',
      data.code         || '',
      JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
      data.projectId    || '',
      now(),
      id,
    ]
  );
  persist();
};

export const deleteSnippet = async (id) => {
  const db = await getDB();
  db.run(`DELETE FROM snippets WHERE id=?`, [id]);
  persist();
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = async (userId) => {
  const db = await getDB();
  const results = db.exec(`SELECT * FROM projects WHERE user_id=? ORDER BY created_at DESC`, [userId]);
  return toRows(results).map(mapProject);
};

export const getProject = async (id) => {
  const db = await getDB();
  const results = db.exec(`SELECT * FROM projects WHERE id=?`, [id]);
  const rows = toRows(results);
  return rows.length ? mapProject(rows[0]) : null;
};

export const addProject = async (data) => {
  const db = await getDB();
  const id = uid();
  db.run(
    `INSERT INTO projects (id,name,description,color,user_id,created_at) VALUES (?,?,?,?,?,?)`,
    [id, data.name, data.description || '', data.color || '#6366f1', data.userId, now()]
  );
  persist();
  return id;
};

export const updateProject = async (id, data) => {
  const db = await getDB();
  db.run(
    `UPDATE projects SET name=?,description=?,color=? WHERE id=?`,
    [data.name, data.description || '', data.color || '#6366f1', id]
  );
  persist();
};

export const deleteProject = async (id) => {
  const db = await getDB();
  db.run(`DELETE FROM projects WHERE id=?`, [id]);
  persist();
};

export const getSnippetCountByProject = async (userId, projectId) => {
  const db = await getDB();
  const results = db.exec(
    `SELECT COUNT(*) as count FROM snippets WHERE user_id=? AND project_id=?`,
    [userId, projectId]
  );
  const rows = toRows(results);
  return rows.length ? (rows[0].count || 0) : 0;
};

// ─── User data management ─────────────────────────────────────────────────────
export const deleteAllUserData = async (userId) => {
  const db = await getDB();
  db.run(`DELETE FROM snippets WHERE user_id=?`, [userId]);
  db.run(`DELETE FROM projects WHERE user_id=?`, [userId]);
  persist();
};

// ─── Backup / Restore ─────────────────────────────────────────────────────────
export const exportDBFile = async () => {
  const db = await getDB();
  const data = db.export();
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `snippetflow-backup-${new Date().toISOString().split('T')[0]}.db`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDBFile = async (file) => {
  const buf  = await file.arrayBuffer();
  const data = new Uint8Array(buf);
  _SQL = _SQL || await initSqlJs({ locateFile: f => `/${f}` });
  _db  = new _SQL.Database(data);
  persist();
};
