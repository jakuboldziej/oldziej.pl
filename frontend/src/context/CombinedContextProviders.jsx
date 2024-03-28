import { ThemeProvider } from '@/components/theme-provider';
import { AuthContextProvider } from './AuthContext';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/sonner';
import { FilesContextProvider } from './FilesContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthContextProvider>
        <DartsGameContextProvider>
          <FilesContextProvider>
            {children}
            <Toaster />
          </FilesContextProvider>
        </DartsGameContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
