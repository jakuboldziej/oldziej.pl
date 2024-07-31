import { ThemeProvider } from '@/components/theme-provider';
import { PortfolioContextProvider } from './PortfolioContext';

export const PortfolioContextProviders = ({ children }) => {
  return (
    <PortfolioContextProvider>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        {children}
      </ThemeProvider>
    </PortfolioContextProvider>
  );
};
