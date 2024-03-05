import { ThemeProvider } from '@/components/theme-provider';
import { AuthContextProvider } from './AuthContext';
import { DartsGameContextProvider } from './DartsGameContext';
import { ToastsContextProvider } from './ToastsContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthContextProvider>
        <DartsGameContextProvider>
          <ToastsContextProvider>
            {children}
          </ToastsContextProvider>
        </DartsGameContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
