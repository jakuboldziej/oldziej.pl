import { useContext, useEffect, useState } from "react";
import { getFilesCreated, getFoldersCreated, getStatisticsDartsGames, getStatisticsDoorHits, getStatisticsOverAllPoints, getStatisticsStorageUsed } from "@/lib/fetch";
import { Card, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/Home/AuthContext";
import ShowNewToast from "@/components/Home/MyComponents/ShowNewToast";
import Loading from "@/components/Home/Loading";
import { buttonVariants } from "@/components/ui/shadcn/button";

function Home() {
  document.title = "Oldziej | Home";

  const navigate = useNavigate();

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
      const storageUsed = await getStatisticsStorageUsed();

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
          <div className="darts-info flex flex-col justify-between h-full flex-wrap gap-10">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="flex justify-center flex-wrap gap-10">
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
              </div>
            )}
            <div className="flex justify-center pb-6">
              <Link className={`${buttonVariants({ variant: "outline_white" })} glow-button-white`} state={{ createNewGame: true }} to="/darts">Play now!</Link>
            </div>
          </div>
        </Card>
        <Card className="my-card">
          <CardHeader>
            <CardTitle><Link to={"/cloud"} className="hover:cursor-pointer hover:opacity-80">Cloud</Link></CardTitle>
          </CardHeader>
          <div className="cloud-info flex flex-col justify-between h-full flex-wrap gap-10">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="flex justify-center flex-wrap gap-10">
                <div className="text-center">
                  <span>Users uploaded</span>
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
              </div>
            )}
            <div className="flex justify-center pb-6">
              <Link className={`${buttonVariants({ variant: "outline_white" })} glow-button-white`} to="/cloud/files/upload">Upload files!</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Home