import React, { useState } from 'react';
import axios from 'axios';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pollType, setPollType] = useState<string>('single'); // default to 'single'
  const [message, setMessage] = useState<string>('');

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('User is not logged in.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/polls', {
        title,
        description,
        poll_type: pollType,
        created_by: parseInt(userId),
      });

      setMessage('Poll created successfully!');
      onClose(); // Close modal after success
    } catch (err) {
      console.error('Error creating poll:', err);
      setMessage('Error creating poll.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Poll</h2>
        <form onSubmit={handleCreatePoll}>
          <div className="form-group">
            <label>Poll Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Poll Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Poll Type</label>
            <select
              value={pollType}
              onChange={(e) => setPollType(e.target.value)}
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>
          <button type="submit">Create Poll</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default CreatePollModal;
