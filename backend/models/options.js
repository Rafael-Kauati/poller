// backend/models/options.js
const db = require('../config/db');

// Create a new option
const createOption = async (pollId, label) => {
  return db.one(
    'INSERT INTO options (poll_id, label) VALUES ($1, $2) RETURNING id',
    [pollId, label]
  );
};

// Get options by poll ID
const getOptionsByPollId = async (pollId) => {
  return db.any('SELECT * FROM options WHERE poll_id = $1', [pollId]);
};

// Update an option
const updateOption = async (id, label) => {
  return db.none('UPDATE options SET label = $1 WHERE id = $2', [label, id]);
};

// Delete an option
const deleteOption = async (id) => {
  return db.none('DELETE FROM options WHERE id = $1', [id]);
};

module.exports = {
  createOption,
  getOptionsByPollId,
  updateOption,
  deleteOption,
};
