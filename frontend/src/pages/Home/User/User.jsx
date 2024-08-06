import Loading from "@/components/Home/Loading";
import { getAuthUser } from "@/fetch";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

function User() {
  const location = useLocation();
  const userDisplayName = location.pathname.split("/")[2];
  document.title = `Oldziej | ${userDisplayName}`;

  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const fetchUser = await getAuthUser(userDisplayName);
      setUser(fetchUser);

      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className='user text-white text-center p-5'>
      {isLoading ? (
        <Loading />
      ) : (
        <span>{user.displayName}</span>
      )}
    </div>
  )
}

export default User