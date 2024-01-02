/* eslint-disable react/prop-types */
import { createContext, useState } from 'react';

export const DartsGameContext = createContext();

export const DartsGameContextProvider = ({ children }) => {
  const [game, setGame] = useState(() => {
    const storedGame = localStorage.getItem('dartsGame');
    return storedGame ? JSON.parse(storedGame) : null;
  });

  return (
    <DartsGameContext.Provider value={{ game, setGame }}>
      {children}
    </DartsGameContext.Provider>
  );
};