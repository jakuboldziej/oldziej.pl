import { socket, onReconnectionStateChange, onReconnected } from '@/lib/socketio';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getAuthUser } from '@/lib/fetch';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import Cookies from 'js-cookie';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Loader2 } from 'lucide-react';

export const SocketIoContext = createContext();

export const SocketIoContextProvider = ({ children }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [isServerConnected, setIsServerConnected] = useState(socket.connected);
  const [reconnectionState, setReconnectionState] = useState({
    isReconnecting: false,
    attempt: 0,
    maxAttempts: 5
  });
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [listeners, setListeners] = useState({
    friendsRequestsReceived: 0,
    acceptedRequestFrom: '',
    declinedRequestFrom: '',
    canceledRequestFrom: '',
    removedByFriend: '',
  });

  // Emitters

  const addingOnlineUser = async (displayName) => {
    const user = await getAuthUser(displayName);

    setListeners((prev) => ({
      ...prev,
      friendsRequestsReceived: user.friendsRequests.received.length
    }));

    const emitData = {
      user: {
        ...user,
        online: true,
        socketId: socket.id,
      }
    }
    socket.emit("addingOnlineUser", JSON.stringify(emitData));
  }

  // Listeners

  useEffect(() => {
    if (!currentUser) return;

    const getOnlineUsers = async (data) => {
      const { updatedOnlineUsers, isUserOnline, updatedUser } = JSON.parse(data);
      const authUser = await getAuthUser(currentUser.displayName);
      const updatedCurrentUserFriends = updatedOnlineUsers.filter((user) => {
        if (authUser.friends.includes(user.displayName)) return user;
      })
      setOnlineFriends(updatedCurrentUserFriends);

      const isUserFriendsWithCurrentUser = authUser.friends.find((friendsDisplayName) => friendsDisplayName === updatedUser.displayName);
      if (isUserFriendsWithCurrentUser) {
        if (isUserOnline) {
          ShowNewToast(updatedUser.displayName, "Is online.");
        } else {
          ShowNewToast(updatedUser.displayName, "Is offline.");
        }
      }
    }

    const sendFriendsRequest = (data) => {
      const { ...requestData } = JSON.parse(data);

      if (requestData.userDisplayName === currentUser.displayName) {
        setListeners((prev) => ({
          ...prev,
          friendsRequestsReceived: requestData.friendsRequestsReceived
        }));

        if (requestData?.friendsRequestsReceived) {
          ShowNewToast("Friends", `${requestData.currentUserDisplayName} sent you a friend request!`)
        }
      }
    }

    const acceptFriendsRequest = (data) => {
      const { ...requestData } = JSON.parse(data);

      if (requestData.accepted && requestData.sentFrom === currentUser.displayName) {
        setListeners((prev) => ({
          ...prev,
          acceptedRequestFrom: requestData.sentTo
        }));
        ShowNewToast("Friends", `${requestData.sentTo} accepted your friends request!`)
      }
    }

    const declineFriendsRequest = (data) => {
      const { ...requestData } = JSON.parse(data);

      if (requestData.declined && requestData.sentFrom === currentUser.displayName) {
        setListeners((prev) => ({
          ...prev,
          declinedRequestFrom: requestData.sentTo
        }));
        ShowNewToast("Friends", `${requestData.sentTo} declined your friends request.`)
      }
    }

    const cancelFriendsRequest = (data) => {
      const { ...requestData } = JSON.parse(data);

      if (requestData.canceled && requestData.sentTo === currentUser.displayName) {
        setListeners((prev) => ({
          ...prev,
          canceledRequestFrom: requestData.sentFrom
        }));
        ShowNewToast("Friends", `${requestData.sentFrom} canceled their friend request.`)
      }
    }

    const removeFriend = (data) => {
      const { ...requestData } = JSON.parse(data);

      if (requestData.removed && requestData.removedUser === currentUser.displayName) {
        setListeners((prev) => ({
          ...prev,
          removedByFriend: requestData.removedBy
        }));
        ShowNewToast("Friends", `${requestData.removedBy} removed you as a friend.`)
      }
    }

    const updateCounters = (data) => {
      const { currentUserDisplayName, ...counterData } = JSON.parse(data);

      if (currentUserDisplayName === currentUser.displayName) {
        setListeners((prev) => ({
          ...prev,
          ...counterData
        }));
      }
    }

    const verifyEmail = async (data) => {
      const verifyData = JSON.parse(data);
      const userLoggedIn = currentUser.displayName === verifyData.userDisplayName;

      if (!userLoggedIn) return;

      if (verifyData.verified) {
        ShowNewToast("Verify Email", "Your email was verified!");
      }
      else {
        ShowNewToast("Verify Email", "Your account was disproved.");
      }
      const domain = import.meta.env.MODE === "development" ? ".home.localhost" : ".home.oldziej.pl";
      const cookie = JSON.parse(Cookies.get("_auth_state"));
      cookie.verified = verifyData.verified;
      Cookies.set("_auth_state", JSON.stringify(cookie), { domain });
      setCurrentUser(cookie);
    }

    socket.on('onlineUsersListener', getOnlineUsers);
    socket.on('sendFriendsRequest', sendFriendsRequest);
    socket.on('acceptFriendsRequest', acceptFriendsRequest);
    socket.on('declineFriendsRequest', declineFriendsRequest);
    socket.on('cancelFriendsRequest', cancelFriendsRequest);
    socket.on('removeFriend', removeFriend);
    socket.on('updateCounters', updateCounters);
    socket.on('verifyEmail', verifyEmail);

    return () => {
      socket.off('onlineUsersListener', getOnlineUsers);
      socket.off('sendFriendsRequest', sendFriendsRequest);
      socket.off('acceptFriendsRequest', acceptFriendsRequest);
      socket.off('declineFriendsRequest', declineFriendsRequest);
      socket.off('cancelFriendsRequest', cancelFriendsRequest);
      socket.off('removeFriend', removeFriend);
      socket.off('updateCounters', updateCounters);
      socket.off('verifyEmail', verifyEmail);
    };
  }, [currentUser]);

  // Connection handling

  useEffect(() => {
    if (currentUser && !isServerConnected) {
      socket.connect();
    } else if (!currentUser && isServerConnected) {
      socket.disconnect();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && isServerConnected) {
      addingOnlineUser(currentUser.displayName);
    }
  }, [currentUser, isServerConnected]);

  useEffect(() => {
    const connectToServer = () => {
      setIsServerConnected(true);
    }

    const disconnectFromServer = () => {
      setIsServerConnected(false);
    }

    socket.on('connect', connectToServer);
    socket.on('disconnect', disconnectFromServer);

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('connect', connectToServer);
      socket.off('disconnect', disconnectFromServer);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onReconnectionStateChange((state) => {
      setReconnectionState(state);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onReconnected(() => {
      if (currentUser && isServerConnected) {
        addingOnlineUser(currentUser.displayName);
      }
    });

    return unsubscribe;
  }, [currentUser, isServerConnected]);

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <SocketIoContext.Provider value={{ isServerConnected, onlineFriends, listeners, setListeners }}>
      {children}

      <Dialog open={reconnectionState.isReconnecting}>
        <DialogContent className="text-white max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogTitle className="text-center text-xl font-semibold">
            {reconnectionState.attempt >= reconnectionState.maxAttempts
              ? "Connection Lost"
              : "Reconnecting..."}
          </DialogTitle>
          <DialogDescription className="hidden">Connection status information</DialogDescription>

          <div className="flex flex-col items-center gap-4 py-4">
            {reconnectionState.attempt < reconnectionState.maxAttempts ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-center text-muted-foreground">
                  Attempting to reconnect to the server...
                </p>
                <p className="text-sm text-muted-foreground">
                  Attempt {reconnectionState.attempt} of {reconnectionState.maxAttempts}
                </p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-destructive/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-destructive">
                    Unable to connect to the server
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your internet connection and try again.
                  </p>
                </div>
                <Button
                  onClick={handleRefreshPage}
                  className="w-full mt-2"
                  variant="default"
                >
                  Refresh Page
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SocketIoContext.Provider>
  );
};