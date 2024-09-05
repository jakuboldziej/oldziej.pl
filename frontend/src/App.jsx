import { BrowserRouter } from 'react-router-dom';
import AppRoutesHome from './AppRoutesHome';
import AppRoutesPortfolio from './AppRoutesPortfolio';
import ReactGA from 'react-ga4';

function App() {
  ReactGA.initialize('9661304313');

  const subdomain = window.location.host.split(".")[0];
  let AppRoutes;

  if (subdomain === "home") {
    AppRoutes = AppRoutesHome
  } else {
    AppRoutes = AppRoutesPortfolio
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App