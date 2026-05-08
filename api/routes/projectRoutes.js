const express = require('express');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { verifyUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyUser, async (req, res) => {
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

router.post('/', verifyUser, async (req, res) => {
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

router.put('/:id', verifyUser, async (req, res) => {
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

router.delete('/:id', verifyUser, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/count', verifyUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM snippets WHERE user_id=$1 AND project_id=$2', [req.user.id, req.params.id]);
    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
