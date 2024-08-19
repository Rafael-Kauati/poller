const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

// Load environment variables from the root of the project
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const app = express();
app.use(express.json());

// Morgan middleware for HTTP request logging
app.use(morgan('dev'));

// CORS configuration: Allow all origins
app.use(cors());

// JWT Secret should be loaded from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Failed to authenticate token');
    req.user = decoded;
    next();
  });
};

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(`Attempting to register user: ${username}, ${email}`);
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );
    
    console.log('Query result:', result);
    
    if (Array.isArray(result) && result.length > 0) {
      const userId = result[0].id;
      console.log(`User registered successfully: ${email}, User ID: ${userId}`);
      
      res.status(201).json({ userId });
    } else {
      throw new Error('Unexpected result format');
    }
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Attempting to log in user: ${email}`);
  
  try {
    // Fetch the user by email
    const result = await pool.query('SELECT id, password FROM users WHERE email = $1', [email]);

    console.log('User fetched',result )
     userId = null;
     upass  = null;

    
    if (Array.isArray(result) && result.length > 0) {
       userId = result[0].id;
       upass = result[0].password;
      console.log(`User password: ${userId}, User ID: ${upass}`);
      const match = await bcrypt.compare(password, upass);
      if (!match) {
        console.warn(`Login attempt failed: Invalid credentials - ${email}`);
        return res.status(400).send('Invalid credentials');
      }
      console.log(`User logged in successfully: ${email} with ID ${userId}`);
      res.json({ userId: userId });

      res.status(201).json({ userId });
    } else {
      throw new Error('Unexpected result format');
    }

  } catch (err) {
    console.error('Error logging in:', err);
    //res.status(500).send('Error logging in');
  }
});


app.post('/polls', async (req, res) => {
  const { title, description, poll_type, userId } = req.body; // Include userId in the request body

  // Debug: Log incoming request body
  console.log(`Creating poll with data:`, { title, description, poll_type, userId });
  
  try {
    const result = await pool.query(
      'INSERT INTO polls (title, description, created_by, poll_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, userId, poll_type]
    );

    // Debug: Log the database query result
    console.log('Database query result:', result);

    // Check if rows are present
    if (Array.isArray(result)) {
      
      console.log('Poll created successfully:', result);
      res.status(201).json(result);
    } else {
      console.error('Poll creation failed, no rows returned');
      res.status(500).send('Poll creation failed, no rows returned');
    }
  } catch (err) {
    console.error('Error creating poll:', err.message);
    res.status(500).send('Error creating poll');
  }
});




// Add options to a poll
app.post('/polls/:pollId/options', async (req, res) => {
  const { pollId } = req.params;
  const { label } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO options (poll_id, label) VALUES ($1, $2) RETURNING *',
      [pollId, label]
    );
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding option:', err);
    res.status(500).send('Error adding option');
  }
});

app.post('/polls/:pollId/vote', async (req, res) => {
  const { pollId } = req.params;
  const { optionId, userId } = req.body; // Include userId in the request body

  try {
    // Check if the user has already voted in this poll
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE poll_id = $1 AND user_id = $2',
      [pollId, userId]
    );
    console.log("fetch res : ",existingVote)
    if (Array.isArray(existingVote) && !(existingVote.length === 0)) {
      return res.status(400).send('User has already voted in this poll');
    }

    // Insert the vote
    await pool.query(
      'INSERT INTO votes (poll_id, user_id, option_id) VALUES ($1, $2, $3)',
      [pollId, userId, optionId]
    );
    res.status(201).send('Vote recorded');
  } catch (err) {
    console.error('Error voting:', err);
    res.status(500).send('Error voting');
  }
});


// Protected Route Example
app.get('/protected', authenticate, (req, res) => {
  console.log(`Accessing protected route - User ID: ${req.user.userId}`);
  res.json({ message: 'This is a protected route', userId: req.user.userId });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
