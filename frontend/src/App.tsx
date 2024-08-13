import React from 'react';
import Login from './components/Login.tsx';
import Protected from './components/Protected.tsx';
import SignUp from './components/SignUp.tsx';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Authentication Example</h1>
      <SignUp />
      <Login />
      <Protected />
    </div>
  );
};

export default App;
