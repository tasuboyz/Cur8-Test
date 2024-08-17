import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  userId: number | null;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

const UserContext = createContext<User>({ userId: null });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({ userId: null });

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = () => {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user) {
      setUser({
        userId: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
      });
    }
  };

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
