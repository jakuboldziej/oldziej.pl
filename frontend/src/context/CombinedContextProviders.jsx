import { ThemeProvider } from '@/components/theme-provider';
import { AuthContextProvider } from './AuthContext';
import { DartsGameContextProvider } from './DartsGameContext';
import { ToastsContextProvider } from './ToastsContext';
import { Toaster } from '@/components/ui/sonner';

export const CombinedContextProvider = ({ children }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthContextProvider>
        <DartsGameContextProvider>
          <ToastsContextProvider>
            {children}
            <Toaster />
          </ToastsContextProvider>
        </DartsGameContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
