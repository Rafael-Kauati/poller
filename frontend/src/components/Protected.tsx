// Protected.tsx
import React, { useState } from 'react';
import axios from 'axios';

const Protected: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const handleAccessProtectedRoute = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found, please log in.');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
    } catch (err) {
      setMessage('Access denied. Invalid token.');
    }
  };

  return (
    <div>
      <h2>Protected Route</h2>
      <button onClick={handleAccessProtectedRoute}>Access Protected Route</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Protected;
