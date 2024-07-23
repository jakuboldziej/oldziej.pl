import { useContext, useEffect, useState } from "react";
import NavBar from "@/components/Home/NavBar"
import { getDartsUsers } from "@/fetch";
import { Card, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FtpContext } from "@/context/FtpContext";
import { AuthContext } from "@/context/AuthContext";

function Home() {
  document.title = "Oldziej | Home";

  const { currentUser } = useContext(AuthContext);
  const { files, fetchFiles, folders, fetchFolders } = useContext(FtpContext);

  const [dartUsers, setDartUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // first data fetch
    const getDartUsers = async () => {
      try {
        setDartUsers(await getDartsUsers());
        setIsLoading(false);
      } catch (err) {
        console.log('Error fetching', err);
        setIsLoading(false);
      }
    }
    getDartUsers();

    if (currentUser && !files) fetchFiles(currentUser);
    if (currentUser && !folders) fetchFolders(currentUser);
  }, []);

  return (
    <>
      <NavBar />
      <div className='home-page'>
        <div className="cards">
          <Card className="my-card">
            <CardHeader>
              <CardTitle><Link to={"/darts"} className="hover:cursor-pointer hover:opacity-80">Darts</Link></CardTitle>
            </CardHeader>
            <div className="info">
              {isLoading ?
                <div className="flex justify-center w-100 pt-3">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                : dartUsers && dartUsers.map((dartUser) => {
                  return (
                    <a href={`/darts/users/${dartUser.displayName}`} key={dartUser._id} className="element">
                      <span className="elementInfo username">{dartUser.displayName}</span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                        {dartUser.podiums["firstPlace"]}
                      </span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                        {dartUser.throws["doors"]}
                      </span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                        {dartUser.gamesPlayed}
                      </span>
                      <span className="elementInfo">
                        <img width="25" height="25" src="https://img.icons8.com/arcade/20/graph.png" alt="graph" />
                        <h6 style={{ fontSize: 13 }}>{dartUser.highestEndingAvg}</h6>
                      </span>
                    </a>
                  )
                })}
            </div>
          </Card>
          <Card className="my-card">
            <CardHeader>
              <CardTitle><Link to={"/cloud"} className="hover:cursor-pointer hover:opacity-80">Cloud</Link></CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Home