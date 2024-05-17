import { ThemeProvider } from '@/components/theme-provider';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/sonner';
import { FtpContextProvider } from './FtpContext';
import { AuthContextProvider } from './AuthContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <AuthContextProvider>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <DartsGameContextProvider>
          <FtpContextProvider>
            {children}
            <Toaster />
          </FtpContextProvider>
        </DartsGameContextProvider>
      </ThemeProvider>
    </AuthContextProvider>
  );
};
