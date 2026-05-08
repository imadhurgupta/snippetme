const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { verifyUser, generateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/me', verifyUser, (req, res) => {
  res.json({ user: req.user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    let user;
    
    if (result.rows.length === 0) {
      const id = crypto.randomUUID();
      const hash = await bcrypt.hash(password, 10);
      const ts = Date.now();
      const name = email.split('@')[0];
      
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1,$2,$3,$4,$5)',
        [id, name, email, hash, ts]
      );
      
      user = { id, email, name, picture: null };
    } else {
      user = result.rows[0];
      if (!user.password_hash) return res.status(401).json({ error: 'Account uses another login method' });
      
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      
      user = { id: user.id, email: user.email, name: user.name, picture: user.picture };
    }
    
    res.json({ token: generateToken(user), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
