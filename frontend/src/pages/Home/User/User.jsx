import Loading from "@/components/Home/Loading";
import { getAuthUser, getDartsUser } from "@/lib/fetch";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { AuthContext } from "@/context/Home/AuthContext";
import UserHeader from "./components/UserHeader";
import OverviewTab from "./components/OverviewTab";
import DartsStatsTab from "./components/DartsStatsTab";
import FriendsTab from "./components/FriendsTab";

function User() {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const userDisplayName = location.pathname.split("/")[2];
  document.title = `Oldziej | ${userDisplayName}`;

  const [user, setUser] = useState(null);
  const [dartsUser, setDartsUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedUser, fetchedDartsUser] = await Promise.all([
          getAuthUser(userDisplayName),
          getDartsUser(userDisplayName)
        ]);
        
        setUser(fetchedUser);
        setDartsUser(fetchedDartsUser);

        if (fetchedUser?.friends?.length > 0) {
          const friendsData = await Promise.all(
            fetchedUser.friends.map(friendName => getAuthUser(friendName))
          );
          setFriends(friendsData.filter(f => f));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [userDisplayName]);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="text-white text-center p-10">
        <h1 className="text-3xl">User not found</h1>
      </div>
    );
  }

  const isOwnProfile = currentUser?.displayName === user.displayName;

  return (
    <div className='user text-white p-5 max-w-6xl mx-auto'>
      <UserHeader user={user} isOwnProfile={isOwnProfile} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="darts">Darts Stats</TabsTrigger>
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab dartsUser={dartsUser} friends={friends} />
        </TabsContent>

        <TabsContent value="darts">
          <DartsStatsTab dartsUser={dartsUser} />
        </TabsContent>

        <TabsContent value="friends">
          <FriendsTab friends={friends} isOwnProfile={isOwnProfile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default User