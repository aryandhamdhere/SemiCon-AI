import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Hardcoded for demo purposes. Switch between 'Operator', 'Manager', 'Executive', 'Auditor'
  const [user, setUser] = useState({ id: 'USR_999', role: 'Manager' });

  const login = (role) => {
    setUser({ id: `USR_${Math.floor(Math.random() * 1000)}`, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
