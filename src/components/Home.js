import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext.js'; // Add .js extension
import NavigationBar from './NavigationBar.js'; // Add .js extension
import './Home.css'; // CSS for styling the Home segment
import { FaTelegram, FaTwitter } from 'react-icons/fa'; // Icons for community links

const Home = () => {
  const {
    user, // Assuming 'user' contains currentUser info
    psdtBalance,
    setPsdtBalance,
    handleDailyCheckIn,
    checkInStatus,
    fetchTelegramID,
    registerUserAutomatically,
  } = useAppContext(); // Use the custom hook to access context

  const [telegramID, setTelegramID] = useState('');

  useEffect(() => {
    // Fetch Telegram ID from local storage
    const storedTelegramID = localStorage.getItem('telegramId');
    if (storedTelegramID) {
      setTelegramID(storedTelegramID);
    } else {
      // Fetch from server if not in local storage
      const fetchTelegramIDFromServer = async () => {
        try {
          const response = await fetch('/api/fetchTelegramID');
          const data = await response.json();
          setTelegramID(data.telegramID || 'Loading...');
        } catch (error) {
          console.error('Error fetching Telegram ID:', error);
          setTelegramID('Error loading ID');
        }
      };

      fetchTelegramIDFromServer();
    }
  }, []);

  const handleCheckIn = async () => {
    if (!checkInStatus) {
      await handleDailyCheckIn(); // Update context to reflect check-in status
      setPsdtBalance((prevBalance) => prevBalance + 100); // Add +100 PSDT to balance
      alert('Successfully checked in! +100 PSDT added to your balance.');
    }
  };

  return (
    <div className="home-container">
      {/* Display User's Telegram ID */}
      <div className="user-id">
        <span>Telegram ID: {telegramID}</span> {/* Display Telegram ID */}
      </div>

      {/* Daily Check-in Button */}
      <div className="check-in">
        <button onClick={handleCheckIn} disabled={checkInStatus}>
          {checkInStatus ? 'Checked In' : 'Daily Check-in (+100 PSDT)'}
        </button>
      </div>

      {/* proSEED Logo */}
      <div className="logo">
        <img
          src="https://raw.githubusercontent.com/AltaafML/website/main/git_proSEED_256.png"
          alt="proSEED Logo"
          className="circular-image blended-background"
        />
      </div>

      {/* $PSDT Balance Display */}
      <div className="psdt-balance">
        <h2>$PSDT Balance</h2>
        <div className="balance-amount">
          <span>{psdtBalance} PSDT</span> {/* Reflects opening balance and updates */}
        </div>
      </div>

      {/* Community Links */}
      <div className="community-links">
        <a href="https://t.me/+oT_BLMaqF705YzJk" target="_blank" rel="noopener noreferrer" className="join-link">
          <FaTelegram className="community-icon" /> Join Telegram Community
        </a>
        <a href="https://x.com/proSEED_Eng" target="_blank" rel="noopener noreferrer" className="join-link">
          <FaTwitter className="community-icon" /> Join X Community
        </a>
      </div>

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
};

export default Home;


