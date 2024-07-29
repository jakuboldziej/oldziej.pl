import { socket } from '@/lib/socketio';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getAuthUser } from '@/fetch';
import ShowNewToast from '@/components/Home/MyComponents/ShowNewToast';

export const SocketIoContext = createContext();

export const SocketIoContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [isServerConnected, setIsServerConnected] = useState(socket.connected);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [counters, setCounters] = useState({
    friendsRequestsReceived: 0,
  })

  // Emitters

  const addingOnlineUser = async (displayName) => {
    const user = await getAuthUser(displayName);

    setCounters((prev) => ({
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
    const getOnlineUsers = async (data) => {
      const { updatedOnlineUsers, isUserOnline, updatedUser } = JSON.parse(data);

      const authUser = await getAuthUser(currentUser.displayName);
      const updatedCurrentUserFriends = updatedOnlineUsers.filter((user) => {
        if (authUser.friends.includes(user._id)) return user;
      })
      setOnlineFriends(updatedCurrentUserFriends);

      const isUserFriendsWithCurrentUser = authUser.friends.find((userId) => userId === updatedUser._id);
      if (isUserFriendsWithCurrentUser) {
        if (isUserOnline) {
          ShowNewToast(updatedUser.displayName, "Just went online.");
        } else {
          ShowNewToast(updatedUser.displayName, "Just went offline.");
        }
      }
    }

    const getCounters = async (data) => {
      const { userDisplayName, ...counterData } = JSON.parse(data);
      if (userDisplayName === currentUser.displayName) {
        setCounters((prev) => ({
          ...prev,
          ...counterData
        }));

        if (counterData?.friendsRequestsReceived) {
          ShowNewToast("Friends", "You have a new friend request!")
        }
      }
    }

    socket.on('onlineUsersListener', getOnlineUsers);
    socket.on('countersListener', getCounters);

    return () => {
      socket.off('onlineUsersListener', getOnlineUsers);
      socket.off('countersListener', getCounters);
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

    return () => {
      socket.off('connect', connectToServer);
      socket.off('disconnect', disconnectFromServer);
    };
  }, []);

  return (
    <SocketIoContext.Provider value={{ isServerConnected, onlineFriends, counters }}>
      {children}
    </SocketIoContext.Provider>
  );
};