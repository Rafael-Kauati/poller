// src/components/Polls/Polls.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Polls.css'; // Ensure this file exists and contains the styles

interface Poll {
  id: number;
  title: string;
  description: string;
}

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/polls');
        setPolls(response.data);
      } catch (err) {
        setMessage('Failed to fetch polls.');
      }
    };

    fetchPolls();
  }, []);

  return (
    <div className="polls-container">
      <h1>All Polls</h1>
      {message && <p className="message">{message}</p>}
      <ul className="polls-list">
        {polls.map((poll) => (
          <li key={poll.id} className="poll-item">
            <h2 className="poll-item-title">{poll.title}</h2>
            <p className="poll-item-description">{poll.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Polls;
