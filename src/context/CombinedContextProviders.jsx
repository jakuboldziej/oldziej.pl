/* eslint-disable react/prop-types */
import { AuthContextProvider } from './AuthContext';
import { DartsGameContextProvider } from './DartsGameContext';
import { ToastsContextProvider } from './ToastsContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <AuthContextProvider>
        <DartsGameContextProvider>
          <ToastsContextProvider>
            {children}
          </ToastsContextProvider>
        </DartsGameContextProvider>
    </AuthContextProvider>
  );
};
