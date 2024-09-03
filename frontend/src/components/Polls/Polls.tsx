import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Polls.css';
import Modal from '../Modal/Modal';

interface Poll {
  id: number;
  title: string;
  description: string;
  created_by: number;
  poll_type: string;
  created_at: string;
  creator_username?: string;
}

interface Option {
  id: number;
  label: string;
  poll_id: number;
}

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/polls');
        const pollsData = response.data;

        const pollsWithCreators = await Promise.all(
          pollsData.map(async (poll: Poll) => {
            try {
              const creatorResponse = await axios.get(
                `http://localhost:3000/users/${poll.created_by}`
              );
              poll.creator_username = creatorResponse.data.username;
              return poll;
            } catch (error) {
              console.error(`Error fetching creator for poll ${poll.id}:`, error);
              return poll;
            }
          })
        );

        setPolls(pollsWithCreators);
      } catch (err) {
        setError('Error fetching polls');
        console.error('Error fetching polls:', err);
      }
    };

    fetchPolls();
  }, []);

  const handleViewPoll = async (pollId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/polls/${pollId}/options`
      );
      setOptions(response.data.options);
      const selectedPoll = polls.find((poll) => poll.id === pollId) || null;
      setSelectedPoll(selectedPoll);
      setIsModalOpen(true);
    } catch (err) {
      setError('Error fetching poll options');
      console.error('Error fetching poll options:', err);
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPoll) return;

    const selectedOptions = Array.from(
      (e.target as HTMLFormElement).elements
    )
      .filter((input: any) => input.checked)
      .map((input: any) => input.value);

    try {
      if (selectedPoll.poll_type === 'single') {
        if (selectedOptions.length !== 1) {
          alert('Please select exactly one option.');
          return;
        }
      } else if (selectedPoll.poll_type === 'multiple') {
        // For multiple polls, zero or more options can be selected
      }

      await Promise.all(
        selectedOptions.map((optionId) =>
          axios.post(`http://localhost:3000/polls/${selectedPoll.id}/vote`, {
            optionId,
            userId: localStorage.getItem('userId'), // Assuming userId is stored in localStorage
          })
        )
      );

      alert('Vote registered successfully');
      handleCloseModal(); // Close the modal after successful voting
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          alert('Vote already registered');
        } else {
          console.error('Error voting:', err.response.data);
          alert('Error registering vote');
        }
      } else {
        console.error('An unexpected error occurred:', err);
        alert('An unexpected error occurred');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoll(null);
    setOptions([]);
  };

  return (
    <div className="polls-container">
      <h2>All Polls</h2>
      {error && <p className="error">{error}</p>}
      <div className="polls-list">
        {polls.map((poll) => (
          <div key={poll.id} className="poll-card">
            <h3>{poll.title}</h3>
            <p>{poll.description}</p>
            <p>Created by: {poll.creator_username || 'Unknown'}</p>
            <button onClick={() => handleViewPoll(poll.id)}>View Poll</button>
          </div>
        ))}
      </div>

      {isModalOpen && selectedPoll && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} pollId={selectedPoll.id} userId={parseInt(localStorage.getItem('userId') || '0')}>
          <h2>{selectedPoll.title}</h2>
          <p>{selectedPoll.description}</p>
          <form onSubmit={handleVote}>
            {options.map((option) => (
              <div key={option.id} className="option-item">
                <label>
                  <input
                    type={selectedPoll.poll_type === 'single' ? 'radio' : 'checkbox'}
                    name="pollOption"
                    value={option.id}
                    defaultChecked={false}
                  />
                  {option.label}
                </label>
                <span>{option.votes} votes</span>
              </div>
            ))}
            <button type="submit">Vote</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Polls;
