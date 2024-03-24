import { useEffect, useState } from "react";
import NavBar from "../components/NavBar"
import { getDartsUsers } from "../fetch";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

function Home() {
  document.title = "Oldziej | Home";

  const [dartUsers, setDartUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
              {dartUsers && dartUsers.map((dartUser) => {
                return (
                  <a href={`/darts/users/${dartUser.displayName}`} key={dartUser._id} className="element">
                    <span className="elementInfo username">{dartUser.displayName}</span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                      {dartUser.podiums["firstPlace"]}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                      {dartUser.throws["doors"]}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                      {dartUser.gamesPlayed}
                    </span>
                    <span className="elementInfo">
                      <img width="20" height="20" src="https://img.icons8.com/arcade/20/graph.png" alt="graph" />
                      <h6 style={{ fontSize: 13 }}>{dartUser.highestEndingAvg}</h6>
                    </span>
                  </a>
                )
              })}
            </div>
          </Card>
          <Card className="my-card">
            <CardHeader>
              <CardTitle>FTP</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Home