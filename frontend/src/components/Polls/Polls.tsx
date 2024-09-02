// src/components/Polls/Polls.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal';
import './Polls.css';

interface Poll {
  id: number;
  title: string;
  description: string;
  poll_type: 'single' | 'multiple';
}

interface Option {
  id: number;
  label: string;
  votes: number;
}

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollOptions, setPollOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Assuming userId is stored in localStorage after login
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/polls');
        setPolls(response.data);
      } catch (err) {
        console.error('Error fetching polls:', err);
      }
    };

    fetchPolls();
  }, []);

  const handlePollClick = async (poll: Poll) => {
    setSelectedPoll(poll);
    try {
      const response = await axios.get(`http://localhost:3000/polls/${poll.id}/options/votes`);
      setPollOptions(response.data.options);
      setSelectedOptions([]); // Reset selected options
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching poll options:', err);
    }
  };

  const handleOptionSelect = (optionId: number) => {
    if (selectedPoll?.poll_type === 'single') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions((prevSelectedOptions) =>
        prevSelectedOptions.includes(optionId)
          ? prevSelectedOptions.filter((id) => id !== optionId)
          : [...prevSelectedOptions, optionId]
      );
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      setMessage('You must select at least one option to vote.');
      return;
    }
  
    try {
      // Loop over selected options to submit votes (if multiple)
      for (const optionId of selectedOptions) {
        await axios.post(`http://localhost:3000/polls/${selectedPoll?.id}/vote`, {
          optionId,
          userId, // Send userId in the vote request
        });
      }
  
      setMessage('Vote submitted successfully!');
      setIsModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setMessage('Vote already registered.');
      } else {
        console.error('Error submitting vote:', err);
        setMessage('Error submitting your vote. Please try again.');
      }
    }
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoll(null);
    setPollOptions([]);
    setSelectedOptions([]);
    setMessage('');
  };

  return (
    <div className="polls-container">
      <h1>Polls</h1>
      <ul className="polls-list">
        {polls.map((poll) => (
          <li key={poll.id} className="poll-item" onClick={() => handlePollClick(poll)}>
            <h3 className="poll-item-title">{poll.title}</h3>
            <p className="poll-item-description">{poll.description}</p>
          </li>
        ))}
      </ul>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedPoll && (
          <div>
            <h2>{selectedPoll.title}</h2>
            <ul>
              {pollOptions.map((option) => (
                <li key={option.id}>
                  <label>
                    <input
                      type={selectedPoll.poll_type === 'single' ? 'radio' : 'checkbox'}
                      name="pollOption"
                      value={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionSelect(option.id)}
                    />
                    {option.label} - {option.votes} votes
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={handleVote}>Submit Vote</button>
            {message && <p className="message">{message}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Polls;
