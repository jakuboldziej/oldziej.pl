import { ThemeProvider } from '@/components/theme-provider';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/shadcn/sonner';
import { FtpContextProvider } from './FtpContext';
import { AuthContextProvider } from './AuthContext';
import { SocketIoContextProvider } from './SocketIoContext';

export const HomeContextProviders = ({ children }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthContextProvider>
        <SocketIoContextProvider>
          <DartsGameContextProvider>
            <FtpContextProvider>
              <Toaster />
              {children}
            </FtpContextProvider>
          </DartsGameContextProvider>
        </SocketIoContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
