import Home from './pages/Home/Home';
import NotFound from './pages/Home/NotFound';
import DartsPage from './pages/Home/Darts/DartsPage';
import DartsGame from './pages/Home/Darts/DartsGame';
import DartsUser from "./pages/Home/Darts/UserPreview/DartsUser";
import CloudPage from './pages/Home/Cloud/CloudPage';
import MyFiles from './pages/Home/Cloud/Files/MyFiles';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Shared from './pages/Home/Cloud/Files/Shared';
import Favorites from './pages/Home/Cloud/Files/Favorites';
import UploadFiles from './pages/Home/Cloud/Files/UploadFiles';
import Settings from './pages/Home/Cloud/Settings';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import Storage from './pages/Home/Cloud/Storage';
import Admin from './pages/Home/Admin/Admin';
import { useContext, useEffect } from 'react';
import OnlyForVerifiedPage from './pages/Home/OnlyForVerifiedPage';
import Friends from './pages/Home/User/Friends';
import User from './pages/Home/User/User';
import UserSettings from './pages/Home/User/UserSettings';
import NavBar from './components/Home/NavBar';
import { AuthContext } from './context/Home/AuthContext';
import GameLivePreviewPage from './pages/Home/Darts/GameLivePreview/GameLivePreviewPage';
import JoinFromAnotherDevice from './pages/Home/Darts/GameLivePreview/JoinFromAnotherDevice';
import SuccessPage from './pages/Home/User/SuccessPage';
import MergedAuth from './pages/Home/Authentication/MergedAuth';

function AppRoutesHome() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const location = useLocation();

  const listOfNonNavbarComponents = [
    "/darts/game",
    "/darts/game/live",
    "/darts/game/join-game-from-qrcode"
  ];

  const ProtectedRoute = ({ children }) => {
    return (
      <RequireAuth
        fallbackPath={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`}
      >
        {children}
      </RequireAuth>
    );
  };

  const AdminRequireAuth = ({ children }) => {
    const navigate = useNavigate();

    if (!currentUser) {
      return <LoadingScreen />;
    }

    if (currentUser.role !== "admin") {
      navigate("/");
      return null;
    }

    return children;
  };

  const OnlyVerifiedAccess = ({ children }) => {
    useEffect(() => {
      if (!currentUser) return;
      if (currentUser.verified !== true) {
        navigate('/not-verified');
      }
    }, [currentUser]);

    if (currentUser && currentUser.verified !== true) return <LoadingScreen />;

    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    );
  }

  const LoadingScreen = () => {
    return (
      <div className='text-white h-screen text-center flex justify-center items-center'>
        <span className='text-3xl'>Loading...</span>
      </div>
    )
  }

  const hideNavBar = listOfNonNavbarComponents.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="live" element={<Navigate to={`/darts/game/live`} replace />} />

          <Route path="auth" element={<MergedAuth />} />

          {/* Response pages */}
          <Route path="not-verified" element={<ProtectedRoute><OnlyForVerifiedPage /></ProtectedRoute>} />
          <Route path="success" element={<SuccessPage />} />
        </Route>
        <Route path="darts">
          <Route index element={<ProtectedRoute><DartsPage /></ProtectedRoute>} />
          <Route path='game'>
            <Route index element={<ProtectedRoute><DartsGame /></ProtectedRoute>} />
            <Route path='live' element={<GameLivePreviewPage />} />
            <Route path='join-game-from-qrcode' element={<JoinFromAnotherDevice />} />
          </Route>
          <Route path='users/:username' element={<ProtectedRoute><DartsUser /></ProtectedRoute>} />
        </Route>
        <Route path="cloud" element={<OnlyVerifiedAccess><AuthOutlet fallbackPath={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`} /></OnlyVerifiedAccess>}>
          <Route index element={<ProtectedRoute><CloudPage /></ProtectedRoute>} />
          <Route path='settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path='storage' element={<ProtectedRoute><Storage /></ProtectedRoute>} />
          <Route path='files'>
            <Route index element={<ProtectedRoute><MyFiles /></ProtectedRoute>} />
            <Route path='shared' element={<ProtectedRoute><Shared /></ProtectedRoute>} />
            <Route path='favorites' element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path='upload' element={<ProtectedRoute><UploadFiles /></ProtectedRoute>} />
          </Route>
        </Route>
        <Route path="user">
          <Route index element={<ProtectedRoute><Navigate to={`/user/${currentUser?.displayName}`} replace /></ProtectedRoute>} />
          <Route path=":displayName" element={<ProtectedRoute><User /></ProtectedRoute>} />
          <Route path="friends" element={<ProtectedRoute><OnlyVerifiedAccess><Friends /></OnlyVerifiedAccess></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
        </Route>
        <Route path="admin" element={<AuthOutlet fallbackPath={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`} />}>
          <Route index element={<AdminRequireAuth><Admin /></AdminRequireAuth>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default AppRoutesHome