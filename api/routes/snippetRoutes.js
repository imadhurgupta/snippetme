const express = require('express');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { verifyUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyUser, async (req, res) => {
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

router.post('/', verifyUser, async (req, res) => {
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

router.put('/:id', verifyUser, async (req, res) => {
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

router.delete('/:id', verifyUser, async (req, res) => {
  try {
    await pool.query('DELETE FROM snippets WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
