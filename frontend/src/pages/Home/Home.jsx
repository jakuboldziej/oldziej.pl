import { useContext, useEffect, useState } from "react";
import { getFilesCreated, getFoldersCreated, getStatisticsDartsGames, getStatisticsDoorHits, getStatisticsOverAllPoints, getStatisticsTop3DoorHitters, getStatisticsTop3Players, getStorageUsed } from "@/lib/fetch";
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
  const [cloudStatistics, setCloudStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get Statistics Data
    const fetchData = async () => {
      // Darts
      const gamesPlayed = await getStatisticsDartsGames();
      const overAllPoints = await getStatisticsOverAllPoints();
      const doorHits = await getStatisticsDoorHits();

      setDartsStatistics({
        gamesPlayed: gamesPlayed,
        overAllPoints: overAllPoints,
        doorHits: doorHits
      });

      const filesCreated = await getFilesCreated();
      const foldersCreated = await getFoldersCreated();
      const storageUsed = await getStorageUsed();

      setCloudStatistics({
        filesCreated: filesCreated,
        foldersCreated: foldersCreated,
        storageUsed: storageUsed
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
          <div className="darts-info flex justify-center flex-wrap gap-10">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="text-center">
                  <span>Players played</span>
                  <span className="font-bold">{dartsStatistics.gamesPlayed}</span>
                  <span>games</span>
                </div>
                <div>
                  <span>Players scored</span>
                  <span className="font-bold">{dartsStatistics.overAllPoints}</span>
                  <span>points</span>
                </div>
                <div className="text-center">
                  <span>Players threw</span>
                  <span className="font-bold">{dartsStatistics.doorHits}</span>
                  <span>darts at the door</span>
                </div>
              </>
            )}
          </div>
        </Card>
        <Card className="my-card">
          <CardHeader>
            <CardTitle><Link to={"/cloud"} className="hover:cursor-pointer hover:opacity-80">Cloud</Link></CardTitle>
          </CardHeader>
          <div className="darts-info flex justify-center flex-wrap gap-10">
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="text-center">
                  <span>Users created</span>
                  <span className="font-bold">{cloudStatistics.filesCreated}</span>
                  <span>files</span>
                </div>
                <div>
                  <span>Users created</span>
                  <span className="font-bold">{cloudStatistics.foldersCreated}</span>
                  <span>folders</span>
                </div>
                <div className="text-center">
                  <span>Users created</span>
                  <span className="font-bold">{cloudStatistics.storageUsed || "0 Bytes"}</span>
                  <span>of files</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Home