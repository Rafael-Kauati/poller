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

const checkUser = async (uid) => {
  const result = await pool.query(
    'SELECT email FROM users WHERE id = $1',
    [uid]
  );
  console.log("User fetched : ",result)
  
}

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT username, email FROM users WHERE id = $1',
      [id]
    );

    // Check if the user was found
    if (result.length === 0) {
      return res.status(404).send(`User with id ${id} not found`);
    }
    console.log("User fetched : ",result)

    // Send the user data as JSON
    res.status(302).send(result);
  } catch (err) {
    console.error(`Error fetching user with id ${id}:`, err);
    res.status(500).send('Error fetching user');
  }
});


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
  const usercheck = checkUser(userId)


  //Check if user exist
  if(Array.isArray(usercheck) && !(usercheck.length === 0)){
    return res.status(400).send(`User with id : ${userId} not found`)
  }

  //Check if poll exist
  const checkpoll = await pool.query(
    'SELECT title FROM polls WHERE id = $1',
    [pollId]
  )
  if(Array.isArray(checkpoll) && checkpoll.length === 0){
    return res.status(400).send(`Poll with id : ${pollId} not found`)
  }


  //Check if poll option exist
  const checkoption = await pool.query(
    'SELECT label FROM options WHERE id = $1',
    [optionId]
  )
  if(Array.isArray(checkoption) && checkoption.length === 0){
    return res.status(400).send(`Poll option with id : ${optionId} not found`)
  }

  const polltype = await pool.query(
    'SELECT poll_type FROM polls WHERE id = $1',
    [pollId]
  )
  console.log("Poll type ", polltype[0].poll_type)
  const typpe = polltype[0].poll_type


  try {
    // Check if the user has already voted in this poll
    if(typpe == "single"){
      const existingVote = await pool.query(
        'SELECT * FROM votes WHERE poll_id = $1 AND user_id = $2',
        [pollId, userId]
      );
      console.log("fetch res : ",existingVote)
      if (Array.isArray(existingVote) && !(existingVote.length === 0)) {
        return res.status(400).send('User has already voted in this poll');
      }

    }
    else if(typpe == "multiple"){
      const existingVote = await pool.query(
        'SELECT * FROM votes WHERE poll_id = $1 AND user_id = $2 AND option_id = $3',
        [pollId, userId,optionId ]
      );
      console.log("fetch res : ",existingVote)
      if (Array.isArray(existingVote) && !(existingVote.length === 0)) {
        return res.status(400).send('User has already voted in this option');
      }
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


// Fetch all polls with the creator's username
app.get('/polls', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.title, p.description, p.created_by, p.poll_type, p.created_at, u.username AS creator_username
      FROM polls p
      JOIN users u ON p.created_by = u.id
    `);

    res.json(result);
  } catch (err) {
    console.error('Error fetching polls:', err);
    res.status(500).send('Error fetching polls');
  }
});



// Fetch all polls belonging to a user
app.get('/users/:userId/polls', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM polls WHERE created_by = $1', [userId]);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching polls for user ${userId}:`, err);
    res.status(500).send('Error fetching polls for user');
  }
});


// Fetch a poll by title
app.get('/polls/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const result = await pool.query('SELECT * FROM polls WHERE title ILIKE $1', [`%${title}%`]);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching poll with title "${title}":`, err);
    res.status(500).send('Error fetching poll by title');
  }
});


// Fetch a poll and its options
app.get('/polls/:pollId/options', async (req, res) => {
  const { pollId } = req.params;

  try {
    // Perform a join between polls and options tables
    const result = await pool.query(`
      SELECT 
        p.id AS poll_id, 
        p.title AS poll_title, 
        p.description AS poll_description, 
        p.created_by AS poll_creator, 
        p.poll_type AS poll_type,
        p.created_at AS poll_created_at,
        o.id AS option_id,
        o.label AS option_label,
        o.created_at AS option_created_at
      FROM polls p
      LEFT JOIN options o ON p.id = o.poll_id
      WHERE p.id = $1
    `, [pollId]);

    if (result.length === 0) {
      return res.status(404).send('Poll not found');
    }

    // Structure the response
    const poll = {
      id: result.poll_id,
      title: result.poll_title,
      description: result.poll_description,
      created_by: result.poll_creator,
      poll_type: result.poll_type,
      created_at: result.poll_created_at,
      options: result.map(row => ({
        id: row.option_id,
        label: row.option_label,
        created_at: row.option_created_at,
      })).filter(option => option.id !== null) // Filter out null options in case of polls with no options
    };

    res.json(poll);
  } catch (err) {
    console.error(`Error fetching poll and options for poll ${pollId}:`, err);
    res.status(500).send('Error fetching poll and options');
  }
});



app.get('/polls/:pollId/options/votes', async (req, res) => {
  const { pollId } = req.params;

  try {
    // Perform a join between polls, options, and votes tables
    const result = await pool.query(`
      SELECT 
        p.id AS poll_id, 
        p.title AS poll_title, 
        p.description AS poll_description, 
        p.created_by AS poll_creator, 
        p.poll_type AS poll_type,
        p.created_at AS poll_created_at,
        o.id AS option_id,
        o.label AS option_label,
        COUNT(v.id) AS vote_count
      FROM polls p
      LEFT JOIN options o ON p.id = o.poll_id
      LEFT JOIN votes v ON o.id = v.option_id
      WHERE p.id = $1
      GROUP BY p.id, o.id
    `, [pollId]);

    if (result.length === 0) {
      return res.status(404).send('Poll not found');
    }

    // Structure the response
    const poll = {
      id: result.poll_id,
      title: result.poll_title,
      description: result.poll_description,
      created_by: result.poll_creator,
      poll_type: result.poll_type,
      created_at: result.poll_created_at,
      options: result.map(row => ({
        id: row.option_id,
        label: row.option_label,
        votes: parseInt(row.vote_count, 10)
      })).filter(option => option.id !== null) // Filter out null options in case of polls with no options
    };

    res.json(poll);
  } catch (err) {
    console.error(`Error fetching poll and options with votes for poll ${pollId}:`, err);
    res.status(500).send('Error fetching poll and options with votes');
  }
});



// Protected Route Example
app.get('/protected', authenticate, (req, res) => {
  console.log(`Accessing protected route - User ID: ${req.user.userId}`);
  res.json({ message: 'This is a protected route', userId: req.user.userId });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
