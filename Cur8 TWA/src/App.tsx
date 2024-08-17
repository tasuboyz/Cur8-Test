import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './page/LoginPage';
import PostingPage from './page/PostPage';
import LoadingSpinner from './components/LoadingSpinner'; // Assicurati di creare questo componente
import { Telegram } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);

  const getUserInfo = () => {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user) {
        setUserId(user.id);
    }
  };

  React.useEffect(() => {
    const performLogin = async () => {
      try {
        const response = await fetch('/logged', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userId }),
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          console.error('Login failed');
        }
      } catch (error) {
        console.error('Error during login:', error);
      } finally {
        setIsLoading(false);
      }
    };   

    getUserInfo();
    performLogin();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/post" /> : <LoginPage />} />
        <Route path="/post" element={isLoggedIn ? <PostingPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;