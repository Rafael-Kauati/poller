// src/components/Polls/Polls.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal';
import './Polls.css';

interface Poll {
  id: number;
  title: string;
  description: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all polls on component mount
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
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching poll options:', err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoll(null);
    setPollOptions([]);
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
                  {option.label} - {option.votes} votes
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Polls;
