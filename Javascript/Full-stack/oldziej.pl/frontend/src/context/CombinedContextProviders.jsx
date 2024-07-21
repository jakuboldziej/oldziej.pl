import { ThemeProvider } from '@/components/theme-provider';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/shadcn/sonner';
import { FtpContextProvider } from './FtpContext';
import { AuthContextProvider } from './AuthContext';
import { PortfolioContextProvider } from './PortfolioContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <AuthContextProvider>
      <PortfolioContextProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <DartsGameContextProvider>
            <FtpContextProvider>
              {children}
              <Toaster />
            </FtpContextProvider>
          </DartsGameContextProvider>
        </ThemeProvider>
      </PortfolioContextProvider>
    </AuthContextProvider>
  );
};
