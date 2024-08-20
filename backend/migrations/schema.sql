-- Drop the votes table if it exists
DROP TABLE IF EXISTS votes;

-- Drop the options table if it exists
DROP TABLE IF EXISTS options;

-- Drop the polls table if it exists
DROP TABLE IF EXISTS polls;

-- Drop the users table if it exists
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Create the polls table
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  poll_type VARCHAR(10) CHECK (poll_type IN ('single', 'multiple')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the options table
CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  option_id INTEGER REFERENCES options(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
