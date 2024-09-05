import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Polls.css';
import Modal from '../Modal/Modal';
import CreatePollModal from '../CreatePollModal/CreatePollModal';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false); // For create poll modal
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:3000/polls');
        setPolls(response.data);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoll(null);
    setOptions([]);
  };

  const handleCreatePoll = () => {
    setIsCreateModalOpen(true); // Open create poll modal
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
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
            <button onClick={() => handleViewPoll(poll.id)}>View Poll</button>
          </div>
        ))}
      </div>

      {/* Button to open the Create Poll modal */}
      <button onClick={handleCreatePoll}>Create New Poll</button>

      {/* Modal for viewing poll details */}
      {isModalOpen && selectedPoll && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pollId={selectedPoll.id}
          userId={parseInt(localStorage.getItem('userId') || '0')}
        >
          <h2>{selectedPoll.title}</h2>
          <p>{selectedPoll.description}</p>
          <form>
            {options.map((option) => (
              <div key={option.id} className="option-item">
                <label>
                  <input
                    type={
                      selectedPoll.poll_type === 'single' ? 'radio' : 'checkbox'
                    }
                    name="pollOption"
                    value={option.id}
                  />
                  {option.label}
                </label>
                <span> votes</span>
              </div>
            ))}
          </form>
        </Modal>
      )}

      {/* Modal for creating a new poll */}
      {isCreateModalOpen && (
        <CreatePollModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
        />
      )}
    </div>
  );
};

export default Polls;
