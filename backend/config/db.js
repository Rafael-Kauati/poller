// backend/config/db.js
const pgp = require('pg-promise')();
const db = pgp({
  user: process.env.DB_USER || 'myuser',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydatabase',
  password: process.env.DB_PASSWORD || 'mypassword',
  port: process.env.DB_PORT || 5432,
});

module.exports = db;
