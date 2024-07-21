import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

function App() {
  const subdomain = window.location.host.split(".")[0];

  return (
    <BrowserRouter>
      <AppRoutes subdomain={subdomain} />
    </BrowserRouter>
  )
}

export default App