import { ThemeProvider } from '@/components/theme-provider';
import { AuthContextProvider } from './AuthContext';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/sonner';

export const CombinedContextProvider = ({ children }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthContextProvider>
        <DartsGameContextProvider>
          {children}
          <Toaster />
        </DartsGameContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
