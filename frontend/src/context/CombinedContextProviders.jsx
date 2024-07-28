import { ThemeProvider } from '@/components/theme-provider';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/shadcn/sonner';
import { FtpContextProvider } from './FtpContext';
import { AuthContextProvider } from './AuthContext';
import { PortfolioContextProvider } from './PortfolioContext';
import { SocketIoContextProvider } from './SocketIoContext';

export const CombinedContextProvider = ({ children }) => {
  return (
    <AuthContextProvider>
      <SocketIoContextProvider>
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
      </SocketIoContextProvider>
    </AuthContextProvider>
  );
};
