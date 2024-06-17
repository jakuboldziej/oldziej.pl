import Home from './pages/Home/Home'
import HomeP from './pages/Portfolio/Home'
import Login from './pages/Home/Login'
import Register from './pages/Home/Register';
import NotFound from './pages/Home/NotFound';
import DartsPage from './pages/Home/Darts/DartsPage';
import DartsGame from './pages/Home/Darts/DartsGame';
import DartsUser from "./pages/Home/Darts/DartsUser";
import FtpPage from './pages/Home/FTP/FtpPage';
import MyFiles from './pages/Home/FTP/Files/MyFiles';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shared from './pages/Home/FTP/Files/Shared';
import Favorites from './pages/Home/FTP/Files/Favorites';
import UploadFiles from './pages/Home/FTP/Files/UploadFiles';
import Settings from './pages/Home/FTP/Settings';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';
import RequireAuth from '@auth-kit/react-router/RequireAuth'
import Storage from './pages/Home/FTP/Storage';
import NotFoundPortfolio from './pages/Portfolio/NotFoundPortfolio';
import Zaslepka from './components/Portfolio/Zaslepka';

function AppRoutes({ subdomain }) {
  const ProtectedRoute = ({ children }) => {
    return <RequireAuth fallbackPath='/login'>{children}</RequireAuth>;
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
          <Route path="darts" element={<AuthOutlet fallbackPath='/login' />}>
            <Route index element={<ProtectedRoute><DartsPage /></ProtectedRoute>} />
            <Route path='game' element={<ProtectedRoute><DartsGame /></ProtectedRoute>} />
            <Route path='users/:username' element={<ProtectedRoute><DartsUser /></ProtectedRoute>} />
          </Route>
          <Route path="ftp" element={<AuthOutlet fallbackPath='/login' />}>
            <Route index element={<ProtectedRoute><FtpPage /></ProtectedRoute>} />
            <Route path='settings' element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
            <Route path='storage' element={<ProtectedRoute><Storage /></ProtectedRoute>}/>
            <Route path='files'>
              <Route index element={<ProtectedRoute><MyFiles /></ProtectedRoute>}/>
              <Route path='shared' element={<ProtectedRoute><Shared /></ProtectedRoute>}/>
              <Route path='favorites' element={<ProtectedRoute><Favorites/></ProtectedRoute>}/>
              <Route path='upload' element={<ProtectedRoute><UploadFiles /></ProtectedRoute>}/>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/">
            <Route index element={<Zaslepka />} />
          </Route>
          <Route path="/test">
            <Route index element={<HomeP />} />
            <Route path='projects' element={<Navigate to="/test" replace state={{ projectsRedirect: true }} />} />
          </Route>
          <Route path="*" element={<NotFoundPortfolio />} />
        </Routes>
      )}
    </>
  )
}

export default AppRoutes