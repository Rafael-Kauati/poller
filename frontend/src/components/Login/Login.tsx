import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input fields
    if (!email) {
      setMessage('Email is required.');
      return;
    }
    if (!password) {
      setMessage('Password is required.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/login`, {
        email,
        password,
      });

      // Store the JWT token in localStorage
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful!');
      console.log(response.data.token);
    } catch (err) {
      setMessage('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {message && <p className="message">{message}</p>} {/* Display message at the top */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
