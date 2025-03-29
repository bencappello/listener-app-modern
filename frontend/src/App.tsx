import React from 'react';
import { Route, Routes } from 'react-router-dom';

// This is a placeholder for now - we'll build out the actual app later
const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Listener App</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<div>Welcome to Listener App!</div>} />
        </Routes>
      </main>
      <footer>
        <p>Listener App - Music Blog Aggregator</p>
      </footer>
    </div>
  );
};

export default App; 