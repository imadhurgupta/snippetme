const express = require('express');
const { pool } = require('../config/db');
const { verifyUser, generateToken } = require('../middleware/auth');

const router = express.Router();

router.delete('/:userId', verifyUser, async (req, res) => {
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

router.put('/me', verifyUser, async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const newName = name.trim();
    await pool.query('UPDATE users SET name=$1 WHERE id=$2', [newName, req.user.id]);
    
    // Generate new token with updated name
    const updatedUser = { ...req.user, name: newName };
    const newToken = generateToken(updatedUser);
    
    res.json({ success: true, token: newToken, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
