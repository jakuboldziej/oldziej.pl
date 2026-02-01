import { useEffect, useRef } from 'react';
import { checkSession, refreshToken } from '@/lib/fetch';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import Cookies from 'js-cookie';

export const useTokenRefresh = (currentUser) => {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const checkAndRefreshToken = async () => {
      try {
        const session = await checkSession();
        
        if (!session.ok) {
          signOut();
          return;
        }

        if (session.shouldRefresh) {
          const response = await refreshToken();
          
          if (response.token) {
            signIn({
              auth: {
                token: response.token,
                type: "Bearer"
              },
              userState: {
                displayName: currentUser.displayName,
                verified: response.verified,
                role: response.role
              },
            });
          }
        }
      } catch (error) {
        console.error('Token refresh check failed:', error);
      }
    };

    checkAndRefreshToken();

    intervalRef.current = setInterval(checkAndRefreshToken, 60 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser, signIn, signOut]);
};
