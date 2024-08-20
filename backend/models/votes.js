// backend/models/votes.js
const db = require('../config/db');

// Add a vote
const addVote = async (pollId, optionId, userId) => {
  return db.one(
    'INSERT INTO votes (poll_id, option_id, user_id) VALUES ($1, $2, $3) RETURNING id',
    [pollId, optionId, userId]
  );
};

// Get votes by poll ID
const getVotesByPollId = async (pollId) => {
  return db.any('SELECT * FROM votes WHERE poll_id = $1', [pollId]);
};

// Get votes by user ID
const getVotesByUserId = async (userId) => {
  return db.any('SELECT * FROM votes WHERE user_id = $1', [userId]);
};

// Remove a vote
const removeVote = async (id) => {
  return db.none('DELETE FROM votes WHERE id = $1', [id]);
};

module.exports = {
  addVote,
  getVotesByPollId,
  getVotesByUserId,
  removeVote,
};
