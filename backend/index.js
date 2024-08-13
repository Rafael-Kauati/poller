// index.js (inside the backend directory)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root of the project
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const app = express();
app.use(express.json());

// JWT Secret should be loaded from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Error logging in');
  }
});

// Protected Route Example
app.get('/protected', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Failed to authenticate token');
    res.json({ message: 'This is a protected route', userId: decoded.userId });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
