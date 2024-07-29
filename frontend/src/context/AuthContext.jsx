import { createContext, useState } from 'react';
import Cookies from 'js-cookie';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';

const store = createStore({
  authName: "_auth",
  authType: "cookie",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
});

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const userCookie = Cookies.get('_auth_state');
    return userCookie ? JSON.parse(userCookie) : null;
  });

  return (
    <AuthProvider store={store}>
      <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
        {children}
      </AuthContext.Provider>
    </AuthProvider>
  );
};