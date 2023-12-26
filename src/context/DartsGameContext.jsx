/* eslint-disable react/prop-types */
import { createContext, useState } from 'react';

export const DartsGameContext = createContext();

export const DartsGameContextProvider = ({ children }) => {
  const [game, setGame] = useState(null);

  return (
    <DartsGameContext.Provider value={{ game, setGame }}>
      {children}
    </DartsGameContext.Provider>
  );
};