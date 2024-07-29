import CopyTextButton from '@/components/Home/CopyTextButton';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/shadcn/dropdown-menu';
import { Input } from '@/components/ui/shadcn/input';
import { AuthContext } from '@/context/AuthContext';
import { acceptFriendsRequest, declineFriendsRequest, getAuthUser, removeFriend, sendFriendsRequest } from '@/fetch';
import { Copy, Loader2, Menu, User, UserMinus, UserRoundCheck, UserRoundX, UserX } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import RedDot from "@/assets/images/icons/red_dot.png";
import GreenDot from "@/assets/images/icons/green_dot.png";
import { SocketIoContext } from '@/context/SocketIoContext';
import { useNavigate } from 'react-router';

function Friends() {
  document.title = "Oldziej | Friends";

  const navigate = useNavigate();

  const { onlineFriends, listeners, setListeners } = useContext(SocketIoContext);
  const { currentUser } = useContext(AuthContext);

  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFriendsCode, setTypeFriendsCode] = useState('');
  const [err, setErr] = useState("");

  const handleSendNewFriendsRequest = async (e) => {
    e.preventDefault();

    const response = await sendFriendsRequest({
      currentUserDisplayName: currentUser.displayName,
      userFriendCode: typeFriendsCode
    });
    if (response?.sentToUserDisplayName) {
      const pendingFriend = await getAuthUser(response.sentToUserDisplayName);
      authUser.friendsRequests.pending.push({
        _id: pendingFriend._id,
        displayName: pendingFriend.displayName,
      });

      setAuthUser((prev) => ({
        ...prev,
        friendsRequests: {
          pending: authUser.friendsRequests.pending,
          received: prev.friendsRequests.received
        }
      }));
      setTypeFriendsCode('');
    }

    setErr(response.message);
    setTimeout(() => setErr(''), 5000);
  }

  const handleAcceptFriendsRequest = async (userDisplayName) => {
    await acceptFriendsRequest({
      currentUserDisplayName: currentUser.displayName,
      userDisplayName: userDisplayName
    });
    const fetchFriend = await getAuthUser(userDisplayName);
    const fetchFriendData = {
      _id: fetchFriend._id,
      displayName: fetchFriend.displayName,
      friends: fetchFriend.friends,
      friendsCode: fetchFriend.friendsCode,
      online: fetchFriend.online
    }
    const updatedReceivedFriendsRequests = authUser.friendsRequests.received.filter((fUser) => fUser.displayName !== userDisplayName);
    setAuthUser((prev) => ({
      ...prev,
      friends: [...prev.friends, fetchFriendData],
      friendsRequests: {
        pending: prev.friendsRequests.pending,
        received: updatedReceivedFriendsRequests
      }
    }));
  }

  const handleDeclineFriendsRequest = async (userDisplayName) => {
    await declineFriendsRequest({
      currentUserDisplayName: currentUser.displayName,
      userDisplayName: userDisplayName
    });

    const updatedReceivedFriendsRequests = authUser.friendsRequests.received.filter((fUser) => fUser.displayName !== userDisplayName);
    setAuthUser((prev) => ({
      ...prev,
      friendsRequests: {
        pending: prev.friendsRequests.pending,
        received: updatedReceivedFriendsRequests
      }
    }));
  }

  const handleCancelFriendsRequest = async (userDisplayName) => {
    await declineFriendsRequest({
      currentUserDisplayName: userDisplayName,
      userDisplayName: currentUser.displayName
    });

    const updatedPendingFriendsRequests = authUser.friendsRequests.pending.filter((fUser) => fUser.displayName !== userDisplayName);
    setAuthUser((prev) => ({
      ...prev,
      friendsRequests: {
        pending: updatedPendingFriendsRequests,
        received: prev.friendsRequests.received
      }
    }));
  }

  const handleRemoveFriend = async (userDisplayName) => {
    await removeFriend({
      currentUserDisplayName: currentUser.displayName,
      userDisplayName: userDisplayName
    });
    const updatedAuthUserFriends = authUser.friends.filter((fUser) => fUser.displayName !== userDisplayName);
    setAuthUser((prev) => ({
      ...prev,
      friends: updatedAuthUserFriends
    }));
  }

  const updateAuthUserFriends = async (first, authUserFriends, newFriend = false) => {
    if (newFriend) authUserFriends.push(newFriend);

    const updatedAuthUserFriends = authUserFriends.map(async (data) => {
      const fetchFriend = await getAuthUser(first ? data : data.displayName);

      return {
        _id: fetchFriend._id,
        displayName: fetchFriend.displayName,
        friends: fetchFriend.friends,
        friendsCode: fetchFriend.friendsCode,
        online: fetchFriend.online
      }
    });

    return await Promise.all(updatedAuthUserFriends);
  }

  const updateOnlineFriends = async (updatedOnlineFriends) => {
    const updatedOnline = authUser.friends.map((user) => {
      const friend = updatedOnlineFriends.find((onlineFriend) => onlineFriend.displayName === user.displayName);
      if (friend) {
        return {
          _id: friend._id,
          displayName: friend.displayName,
          friends: friend.friends,
          online: friend.online
        }
      }
      else return user;
    });
    const updatedFriends = await updateAuthUserFriends(false, updatedOnline);
    setAuthUser((prev) => ({
      ...prev,
      friends: updatedFriends
    }));
  }

  // Listeners

  useEffect(() => {
    if (authUser) {
      updateOnlineFriends(onlineFriends);
    }
  }, [onlineFriends]);

  useEffect(() => {
    const updateFriends = async () => {
      const updatedPending = authUser.friendsRequests.pending.filter((req) => req.displayName !== listeners.acceptedRequestFrom);
      const fetchFriend = await getAuthUser(listeners.acceptedRequestFrom);
      const fetchFriendData = {
        _id: fetchFriend._id,
        displayName: fetchFriend.displayName,
        friends: fetchFriend.friends,
        friendsCode: fetchFriend.friendsCode,
        online: fetchFriend.online
      }

      setAuthUser((prev) => ({
        ...prev,
        friends: [...prev.friends, fetchFriendData],
        friendsRequests: {
          received: prev.friendsRequests.received,
          pending: updatedPending
        }
      }));
      setListeners((prev) => ({
        ...prev,
        acceptedRequestFrom: ''
      }));
    }

    if (listeners.acceptedRequestFrom && authUser?.displayName &&
      authUser?.friendsRequests.pending.find((req) => req.displayName === listeners.acceptedRequestFrom)) {
      updateFriends();
    } else {
      setListeners((prev) => ({
        ...prev,
        acceptedRequestFrom: ''
      }));
    }
  }, [listeners.acceptedRequestFrom, authUser?.displayName]);

  useEffect(() => {
    const updateReceivedRequests = async () => {
      let fetchAuthUser = await getAuthUser(currentUser.displayName);
      const updatedReceivedRequests = fetchAuthUser.friendsRequests.received.map(async (userId) => {
        const receivedFriend = await getAuthUser(userId);
        return {
          _id: receivedFriend._id,
          displayName: receivedFriend.displayName,
        }
      });

      fetchAuthUser.friendsRequests.received = await Promise.all(updatedReceivedRequests);
      fetchAuthUser.friends = authUser.friends;
      setAuthUser(fetchAuthUser);
    }
    authUser?.displayName && listeners.friendsRequestsReceived > 0 && updateReceivedRequests();
  }, [listeners.friendsRequestsReceived, authUser?.displayName]);


  useEffect(() => {
    const fetchData = async () => {
      let fetchAuthUser = await getAuthUser(currentUser.displayName);

      const authUserFriends = await updateAuthUserFriends(true, fetchAuthUser.friends);

      // Getting friend requests
      const updatedPendingRequests = fetchAuthUser.friendsRequests.pending.map(async (userId) => {
        const pendingFriend = await getAuthUser(userId);
        return {
          _id: pendingFriend._id,
          displayName: pendingFriend.displayName,
        }
      });
      const updatedReceivedRequests = fetchAuthUser.friendsRequests.received.map(async (userId) => {
        const receivedFriend = await getAuthUser(userId);
        return {
          _id: receivedFriend._id,
          displayName: receivedFriend.displayName,
        }
      });

      fetchAuthUser.friendsRequests.pending = await Promise.all(updatedPendingRequests);
      fetchAuthUser.friendsRequests.received = await Promise.all(updatedReceivedRequests);
      fetchAuthUser.friends = authUserFriends;
      setAuthUser(fetchAuthUser);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <div className='friends-page flex text-white text-center'>
        <div className='wrapper flex flex-col-reverse sm:flex-row w-full'>
          <div className='cards flex flex-col items-center p-2 sm:p-5 sm:border-r border-green min-w-[380px]'>
            <div className='fixed-wrapper flex flex-col gap-10 left-0 w-full sm:w-[380px]'>
              <div className='your-friends-code flex justify-center'>
                <Card>
                  <CardHeader>
                    <CardTitle>Your friends code</CardTitle>
                  </CardHeader >
                  <CardContent className='flex justify-center gap-2'>
                    <span className='text-3xl'>{authUser?.friendsCode}</span>
                    <CopyTextButton textToCopy={authUser?.friendsCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
                      <MyTooltip title="Copy code to clipboard">
                        <Copy />
                      </MyTooltip>
                    </CopyTextButton>
                  </CardContent>
                </Card>
              </div>
              <div className='friends-code flex justify-center'>
                <Card className=" w-[330px]">
                  <CardHeader>
                    <CardTitle>Send new friend request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSendNewFriendsRequest} className="flex w-full max-w-sm items-center space-x-2">
                      <Input value={typeFriendsCode} onChange={(e) => setTypeFriendsCode(e.target.value)} type="text" placeholder={authUser?.friendsCode} />
                      <Button type="submit" disabled={typeFriendsCode.length === 0}>Send</Button>
                    </form>
                    {err && <span id="error_message">{err}</span>}
                  </CardContent>
                </Card>
              </div>
              <div className='friends-requests flex justify-center w-full'>
                <Card>
                  <CardHeader>
                    <CardTitle>Friend requests</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <div className='pending flex flex-col gap-2'>
                      <span>Pending:</span>
                      <div className='pending-list flex flex-col gap-1'>
                        {isLoading ? (
                          <div className="flex justify-center w-100 pt-3 w-full">
                            <Loader2 className="h-10 w-10 animate-spin" />
                          </div>
                        ) : (
                          authUser.friendsRequests.pending.length > 0 ? authUser.friendsRequests.pending.map((user) => (
                            <div key={user._id} className='request flex items-center justify-around gap-2 rounded-lg p-1'>
                              <span>{user.displayName}</span>
                              <div className='flex gap-1'>
                                <MyTooltip title="Cancel request">
                                  <Button onClick={() => handleCancelFriendsRequest(user.displayName)} variant="outline_red" size="icon" className="justify-center">
                                    <UserX />
                                  </Button>
                                </MyTooltip>
                              </div>
                            </div>
                          )) : (
                            <span>None</span>
                          ))}
                      </div>
                    </div>
                    <div className='received flex flex-col gap-2'>
                      <span>Received:</span>
                      <div className='received-list flex flex-col gap-1'>
                        {isLoading ? (
                          <div className="flex justify-center w-100 pt-3 w-full">
                            <Loader2 className="h-10 w-10 animate-spin" />
                          </div>
                        ) : (
                          authUser.friendsRequests.received.length > 0 ? authUser.friendsRequests.received.map((user) => (
                            <div key={user._id} className='request flex items-center justify-around gap-2 rounded-lg p-1'>
                              <span>{user.displayName}</span>
                              <div className='flex gap-1'>
                                <MyTooltip title="Accept request">
                                  <Button type="button" onClick={() => handleAcceptFriendsRequest(user.displayName)} variant="outline_green" size="icon" className="justify-center">
                                    <UserRoundCheck />
                                  </Button>
                                </MyTooltip>
                                <MyTooltip title="Decline request">
                                  <Button type="button" onClick={() => handleDeclineFriendsRequest(user.displayName)} variant="outline_red" size="icon" className="justify-center">
                                    <UserRoundX />
                                  </Button>
                                </MyTooltip>
                              </div>
                            </div>
                          )) : (
                            <span>None</span>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className='friends flex flex-col gap-5 w-full p-2 sm:p-5'>
            <span className='text-3xl border-b border-green pb-5'>Friends</span>
            <div className='friends-list flex flex-wrap justify-center sm:justify-start gap-5'>
              {isLoading ? (
                <div className="flex justify-center w-100 pt-3 w-full">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
              ) : (
                authUser.friends.length > 0 ? authUser.friends.map((friend) => (
                  <div key={friend._id} className='friend relative rounded-lg border border-green w-[47%] sm:w-40  h-20'>
                    <div className='flex flex-col items-start p-4'>
                      <span className='flex items-center gap-2'>
                        {friend.displayName}
                        {friend.online ? <img src={GreenDot} className='h-[15px]' /> : <img src={RedDot} className='h-[15px]' />}
                      </span>
                      <span className='text-sm text-slate-400'>Friends: {friend.friends.length}</span>
                    </div>
                    <span className='absolute top-0 right-2 h-full flex items-center'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex justify-center">
                            <Menu />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className='gap-2' onClick={() => navigate(`/user/${friend.displayName}`)}><User /> Profile</DropdownMenuItem>
                          <CopyTextButton textToCopy={friend.friendsCode} toastTitle="Code copied" toastDesc="Code copied to clipboard">
                            <DropdownMenuItem>
                              <MyTooltip title="Copy code to clipboard">
                                <span className='flex gap-2'><Copy /> Copy friends code</span>
                              </MyTooltip>
                            </DropdownMenuItem>
                          </CopyTextButton>
                          <DropdownMenuItem className='gap-2' onClick={() => handleRemoveFriend(friend.displayName)}><UserMinus />Remove friend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </span>
                  </div>
                )) : (
                  <span className='text-center text-lg w-full'>Invite some friends!</span>
                ))}
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default Friends