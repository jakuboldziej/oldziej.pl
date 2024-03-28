import Home from './pages/Home/Home'
import HomeP from './pages/Portfolio/Home'
import Login from './pages/Home/Login'
import Register from './pages/Home/Register';
import NotFound from './pages/Home/NotFound';
import DartsPage from './pages/Home/Darts/DartsPage';
import DartsGame from './pages/Home/Darts/DartsGame';
import DartsUser from "./pages/Home/Darts/DartsUser";
import FtpPage from './pages/Home/FTP/FtpPage';
import MyFiles from './pages/Home/FTP/MyFiles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import SharedFiles from './pages/Home/FTP/SharedFiles';
import FavoriteFiles from './pages/Home/FTP/FavoriteFiles';
import UploadFiles from './pages/Home/FTP/UploadFiles';
import SettingsFiles from './pages/Home/FTP/SettingsFiles';

function AppRoutes({ subdomain }) {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <>
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
            <Route path='files/*'>
              <Route index element={<ProtectedRoute><MyFiles /></ProtectedRoute>}/>
              <Route path='shared' element={<ProtectedRoute><SharedFiles/></ProtectedRoute>}/>
              <Route path='favorites' element={<ProtectedRoute><FavoriteFiles/></ProtectedRoute>}/>
              <Route path='upload' element={<ProtectedRoute><UploadFiles /></ProtectedRoute>}/>
              <Route path='settings' element={<ProtectedRoute><SettingsFiles /></ProtectedRoute>}/>
            </Route>
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
    </>
  )
}

export default AppRoutes