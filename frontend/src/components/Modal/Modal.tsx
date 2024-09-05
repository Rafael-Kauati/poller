import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Option {
  id: number;
  label: string;
  votes: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Add this line to accept children
  pollId: any
  userId: any
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, pollId, userId }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      axios.get(`http://localhost:3000/polls/${pollId}/options/votes`)
        .then(response => {
          setOptions(response.data.options);
        })
        .catch(err => {
          console.error('Error fetching poll options:', err);
          setMessage('Error fetching poll options');
        });
    }
  }, [isOpen, pollId]);

  const handleVote = async () => {
    try {
      if (selectedOptions.length === 0) {
        setMessage('Please select an option to vote.');
        return;
      }

      await axios.post(`http://localhost:3000/polls/${pollId}/vote`, {
        userId,
        optionId: selectedOptions[0], // For single-choice polls
      });

      setMessage('Vote recorded successfully!');
      onClose(); // Close the modal after voting
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setMessage('Vote already registered');
      } else {
        console.error('Error registering vote:', err);
        setMessage('Error registering vote');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>
        <h2>Vote for Poll {pollId}</h2>
        <ul>
          {options.map(option => (
            <li key={option.id}>
              <label>
                <input
                  type="checkbox"
                  value={option.id}
                  onChange={e => {
                    const optionId = parseInt(e.target.value);
                    setSelectedOptions(prev =>
                      e.target.checked
                        ? [...prev, optionId]
                        : prev.filter(id => id !== optionId)
                    );
                  }}
                />
                {option.label}
              </label>
              <span> {option.votes} votes</span>
            </li>
          ))}
        </ul>
        <button onClick={handleVote}>Submit Vote</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Modal;
