import React, { useState } from 'react';
import axios from 'axios';
import './SingUp.css'

const SignUp: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input fields
    if (!username) {
      setMessage('Username is required.');
      return;
    }
    if (!email) {
      setMessage('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setMessage('Invalid email format.');
      return;
    }
    if (!password) {
      setMessage('Password is required.');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3000/register`, {
        username,
        email,
        password,
      });
      setMessage('Registration successful!');
    } catch (err) {
      setMessage('Registration failed. Please try again.');
    }
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    // Simple regex for basic email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {message && <p className="message">{message}</p>} {/* Display message at the top */}
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
