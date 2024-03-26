import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Home from './pages/Home/Home'
import HomeP from './pages/Portfolio/Home'
import Login from './pages/Home/Login'
import Register from './pages/Home/Register';
import NotFound from './pages/Home/NotFound';
import DartsPage from './pages/Home/Darts/DartsPage';
import DartsGame from './components/Darts/DartsGame';
import DartsUser from "./pages/Home/Darts/DartsUser";
import FtpPage from './pages/Home/FTP/FtpPage';

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const subdomain = window.location.host.split(".")[0];

  return (
    <BrowserRouter>
      {subdomain === "home" ? (
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Route>
          <Route path="/darts/*">
            <Route index element={<ProtectedRoute><DartsPage /></ProtectedRoute>} />
            <Route path='game' element={<ProtectedRoute><DartsGame /></ProtectedRoute>} />
            <Route path='users/:username' element={<ProtectedRoute><DartsUser /></ProtectedRoute>} />
          </Route>
          <Route path="/ftp/*">
            <Route index element={<ProtectedRoute><FtpPage /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/">
            <Route index element={<HomeP />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App