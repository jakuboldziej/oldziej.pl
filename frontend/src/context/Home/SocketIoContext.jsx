import { socket } from '@/lib/socketio';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getAuthUser } from '@/fetch';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';
import Cookies from 'js-cookie';

export const SocketIoContext = createContext();

export const SocketIoContextProvider = ({ children }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [isServerConnected, setIsServerConnected] = useState(socket.connected);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [listeners, setListeners] = useState({
    friendsRequestsReceived: 0,
    acceptedRequestFrom: '',
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
          ShowNewToast(updatedUser.displayName, "Just went online.");
        } else {
          ShowNewToast(updatedUser.displayName, "Just went offline.");
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
    socket.on('updateCounters', updateCounters);
    socket.on('verifyEmail', verifyEmail);

    return () => {
      socket.off('onlineUsersListener', getOnlineUsers);
      socket.off('sendFriendsRequest', sendFriendsRequest);
      socket.off('acceptFriendsRequest', acceptFriendsRequest);
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

  return (
    <SocketIoContext.Provider value={{ isServerConnected, onlineFriends, listeners, setListeners }}>
      {children}
    </SocketIoContext.Provider>
  );
};