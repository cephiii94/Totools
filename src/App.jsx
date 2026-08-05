import React from 'react';
import { WindowProvider } from './context/WindowContext';
import { Desktop } from './components/desktop/Desktop';

export const App = () => {
  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  );
};
