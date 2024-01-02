/* eslint-disable react/prop-types */
import { AuthContextProvider } from './AuthContext';
import { ChatContextProvider } from './ChatContext';
import { DartsGameContextProvider } from './DartsGameContext';
import { ToastsContextProvider } from './ToastsContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <AuthContextProvider>
      <ChatContextProvider>
        <DartsGameContextProvider>
          <ToastsContextProvider>
            {children}
          </ToastsContextProvider>
        </DartsGameContextProvider>
      </ChatContextProvider>
    </AuthContextProvider>
  );
};
