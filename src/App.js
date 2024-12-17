import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './Context/AppContext';
import Home from './components/Home';
import Opportunity from './components/Opportunity';
import Earn from './components/Earn';
import Leaderboard from './components/Leaderboard';
import Wallet from './components/Wallet';
import NavigationBar from './components/NavigationBar';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <NavigationBar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/opportunity" element={<Opportunity />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

