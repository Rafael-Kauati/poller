import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Polls.css';

interface Poll {
  id: number;
  title: string;
  description: string;
  created_by: number;
  poll_type: string;
  created_at: string;
  creator_username: string; // Updated to match the backend response
}

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/polls');
        setPolls(response.data);
      } catch (err) {
        console.error('Error fetching polls:', err);
        setError('Error fetching polls.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handlePollClick = (pollId: number) => {
    // Logic to open a modal and display poll details
    console.log(`Poll clicked: ${pollId}`);
    // You can set a state to open the modal with poll details
  };

  if (isLoading) return <p>Loading polls...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="polls-container">
      {polls.map((poll) => (
        <div key={poll.id} className="poll-card">
          <h3>{poll.title}</h3>
          <p>{poll.description}</p>
          <p className="poll-creator">Created by: {poll.creator_username}</p>
          <button onClick={() => handlePollClick(poll.id)}>View Poll</button>
        </div>
      ))}
    </div>
  );
};

export default Polls;
