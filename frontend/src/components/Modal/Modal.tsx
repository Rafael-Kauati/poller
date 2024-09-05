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
  pollId: number;
  userId: number;
  children: React.ReactNode; // Ensures we pass children content into the modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, pollId, userId, children }) => {
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
        optionId: selectedOptions[0], // Adjust based on single/multiple choice
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

  // Modal should not render at all if it's not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Vote for Poll {pollId}</h2>
        {children}  {/* Pass children to display custom content */}
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
              <span>{option.votes} votes</span>
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
