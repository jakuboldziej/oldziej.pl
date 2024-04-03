import { ThemeProvider } from '@/components/theme-provider';
import { DartsGameContextProvider } from './DartsGameContext';
import { Toaster } from '@/components/ui/sonner';
import { FilesContextProvider } from './FilesContext';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';

const store = createStore({
  authName: "_auth",
  authType: "cookie", 
  cookieDomain: window.location.hostname,
  cookieSecure: false,
})

export const CombinedContextProvider = ({ children }) => {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider store={store}>
        <DartsGameContextProvider>
          <FilesContextProvider>
            {children}
            <Toaster />
          </FilesContextProvider>
        </DartsGameContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
