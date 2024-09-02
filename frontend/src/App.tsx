// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/Welcome/Welcome';
import Login from './components/Login/Login';
import SignUp from './components/Singin/SignUp';
import Polls from './components/Polls/Polls'; // Import the Polls component
import Protected from './components/Protected';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/polls" element={<Polls />} /> 
          <Route path="/protected" element={<Protected />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
