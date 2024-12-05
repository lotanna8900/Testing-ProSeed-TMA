import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create AppContext
const AppContext = createContext();

// AppContext Provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [psdtBalance, setPsdtBalance] = useState(1000); // Initial balance
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState(false);

  // Fetch user data when component mounts or wallet address changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress) return; // Prevent API call if walletAddress is empty
      try {
        const response = await axios.get(`/api/users/${walletAddress}`);
        setUser(response.data);
        setPsdtBalance(response.data.psdtBalance || 0); // Handle case where psdtBalance might be undefined
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [walletAddress]);

  // Function to update the user's PSDT balance
  const updateBalance = async (newBalance) => {
    if (!user || !user._id) {
      console.error('User data not available for balance update.');
      return;
    }
    try {
      const response = await axios.put(`/api/users/${user._id}/balance`, { balance: newBalance });
      setUser(response.data);
      setPsdtBalance(newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Daily Check-in Function
  const handleDailyCheckIn = () => {
    if (!checkInStatus) {
      const newBalance = psdtBalance + 100;
      setPsdtBalance(newBalance); // Update state
      updateBalance(newBalance); // Persist to database
      setCheckInStatus(true); // Disable further check-ins for the day
    }
  };

  // Function to connect wallet and set wallet address
  const connectWallet = (address) => {
    setWalletAddress(address);
  };

  // Fetch Telegram ID (Mock logic for now)
  const fetchTelegramID = async () => {
    try {
      console.log('Fetching Telegram ID...');
      return { telegramID: '123456789' }; // Replace with actual logic
    } catch (error) {
      console.error('Error fetching Telegram ID:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        psdtBalance,
        walletAddress,
        loading,
        connectWallet,
        updateBalance,
        fetchTelegramID,
        handleDailyCheckIn,
        checkInStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
