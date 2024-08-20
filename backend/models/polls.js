// backend/models/polls.js
const db = require('../config/db');

// Create a new poll
const createPoll = async (title, type, createdBy) => {
  return db.one(
    'INSERT INTO polls (title, type, created_by) VALUES ($1, $2, $3) RETURNING id',
    [title, type, createdBy]
  );
};

// Get all polls
const getAllPolls = async () => {
  return db.any('SELECT * FROM polls');
};

// Get a poll by ID
const getPollById = async (id) => {
  return db.oneOrNone('SELECT * FROM polls WHERE id = $1', [id]);
};

// Update a poll
const updatePoll = async (id, title, type) => {
  return db.none(
    'UPDATE polls SET title = $1, type = $2 WHERE id = $3',
    [title, type, id]
  );
};

// Delete a poll
const deletePoll = async (id) => {
  return db.none('DELETE FROM polls WHERE id = $1', [id]);
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
};
