/* eslint-disable react/prop-types */
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import NotFound from './pages/NotFound';
import DartsPage from './pages/DartsPage';
import DartsGame from './components/Darts/DartsGame';
import DartsUser from "./pages/DartsUser";
 
function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Route>
        <Route path="/darts/*">
          <Route index element={<ProtectedRoute><DartsPage /></ProtectedRoute>} />          
          <Route path='game' element={<ProtectedRoute><DartsGame /></ProtectedRoute>} />
          <Route path='users/:username' element={<ProtectedRoute><DartsUser /></ProtectedRoute>}/>
        </Route>
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App