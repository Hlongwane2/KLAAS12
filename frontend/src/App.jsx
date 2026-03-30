import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { getCurrentUser, setCurrentUser as saveCurrentUserStorage, updateUser, defaultUser } from './utils/storage';
import './index.css';

function App() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(defaultUser);
          saveCurrentUserStorage(defaultUser.username);
        }
      } catch (err) {
        console.error("Failed to load user from DB. Falling back to default user.", err);
        setCurrentUser(defaultUser);
        saveCurrentUserStorage(defaultUser.username);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    saveCurrentUserStorage(user.username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUserStorage(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    updateUser(updatedUser);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#86868B]">
        <p className="font-medium text-lg">Loading Klaas...</p>
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <Dashboard 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser} 
          theme={theme}
          onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
