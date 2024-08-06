import { useContext, useEffect, useState } from "react";
import { getStatisticsTop3DoorHitters, getStatisticsTop3Players } from "@/fetch";
import { Card, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthContext } from "@/context/Home/AuthContext";
import ShowNewToast from "@/components/Home/MyComponents/ShowNewToast";
import Loading from "@/components/Home/Loading";

function Home() {
  document.title = "Oldziej | Home";

  const { currentUser } = useContext(AuthContext);

  const [dartsStatistics, setDartsStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get Statistics Data
    const fetchData = async () => {
      const top3Players = await getStatisticsTop3Players();
      const top3DoorHitters = await getStatisticsTop3DoorHitters();
      setDartsStatistics({
        top3Players: top3Players,
        top3DoorHitters: top3DoorHitters
      });

      setIsLoading(false);
    }
    fetchData();

    if (currentUser && currentUser?.verified === false) {
      ShowNewToast("Verify Email", "Verify your email to get full experience!");
    }
  }, []);

  return (
    <div className='home-page'>
      <div className="cards">
        <Card className="my-card">
          <CardHeader>
            <CardTitle><Link to={"/darts"} className="hover:cursor-pointer hover:opacity-80">Darts</Link></CardTitle>
          </CardHeader>
          <div className="darts-info flex items-center flex-col gap-10">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="top-players flex flex-col items-center gap-5 w-full">
                  <div className="text-lg">Top 3 Players</div>
                  <div className="players flex text-center gap-5">
                    {dartsStatistics.top3Players.map((player, i) => (
                      <div key={player._id} className="flex flex-col items-center gap-1">
                        <span className="font-bold">{player.displayName}</span>
                        {i === 0 ? (
                          <img width="35" height="35" src="https://img.icons8.com/color/35/first-place-ribbon.png" alt="first-place-ribbon" />
                        ) : (
                          i === 1 ? (
                            <img width="35" height="35" src="https://img.icons8.com/color/35/second-place-ribbon.png" alt="second-place-ribbon" />
                          ) : (
                            <img width="35" height="35" src="https://img.icons8.com/color/35/third-place-ribbon.png" alt="third-place-ribbon" />
                          )
                        )}
                        {player.podiums["firstPlace"]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="top-players flex flex-col items-center gap-5 w-full">
                  <div className="text-lg">Top 3 Door Hitters</div>
                  <div className="players flex text-center gap-5">
                    {dartsStatistics.top3DoorHitters.map((player, i) => (
                      <div key={player._id} className="flex flex-col items-center gap-1">
                        <span className="font-bold">{player.displayName}</span>
                        {i === 0 ? (
                          <img width="35" height="35" src="https://img.icons8.com/color/35/first-place-ribbon.png" alt="first-place-ribbon" />
                        ) : (
                          i === 1 ? (
                            <img width="35" height="35" src="https://img.icons8.com/color/35/second-place-ribbon.png" alt="second-place-ribbon" />
                          ) : (
                            <img width="35" height="35" src="https://img.icons8.com/color/35/third-place-ribbon.png" alt="third-place-ribbon" />
                          )
                        )}
                        {player.throws["doors"]}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
        <Card className="my-card">
          <CardHeader>
            <CardTitle><Link to={"/cloud"} className="hover:cursor-pointer hover:opacity-80">Cloud</Link></CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export default Home