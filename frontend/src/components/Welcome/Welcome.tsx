import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css'; // Import the CSS file for styling

const Welcome: React.FC = () => {
  return (
    <div className="welcome-container">
      <h1>Welcome to Our Application</h1>
      <p>Your one-stop solution for secure authentication!</p>
      <div className="button-container">
        <Link to="/register" className="button">Sign Up</Link>
        <Link to="/login" className="button">Login</Link>
      </div>
    </div>
  );
};

export default Welcome;
