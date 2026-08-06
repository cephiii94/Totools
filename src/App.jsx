import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { WindowProvider } from './context/WindowContext';
import { Desktop } from './components/desktop/Desktop';

export const App = () => {
  return (
    <AuthProvider>
      <WindowProvider>
        <Desktop />
      </WindowProvider>
    </AuthProvider>
  );
};

