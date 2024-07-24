import { useEffect, useState } from "react";
import NavBar from "@/components/Home/NavBar";
import { getStatisticsDartsGames, getStatisticsDoorHits, getStatisticsOverAllPoints } from "@/fetch";
import { Card, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

function Home() {
  document.title = "Oldziej | Home";

  const [dartsStatistics, setDartsStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get Statistics Data
    const fetchData = async () => {
      const gamesPlayed = await getStatisticsDartsGames();
      const overAllPoints = await getStatisticsOverAllPoints();
      const doorHits = await getStatisticsDoorHits();
      setDartsStatistics({
        gamesPlayed: gamesPlayed,
        overAllPoints: overAllPoints,
        doorHits: doorHits
      });

      setIsLoading(false);
    }
    fetchData();
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
            <div className="statistics flex justify-center flex-wrap gap-5">
              {isLoading ? (
                <div className="flex justify-center w-100 pt-3">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
              ) : (
                <>
                  <div>
                    <span>We've played</span>
                    <span className="font-bold">{dartsStatistics.gamesPlayed}</span>
                    <span>games</span>
                  </div>
                  <div>
                    <span>We scored</span>
                    <span className="font-bold">{dartsStatistics.overAllPoints}</span>
                    <span>points</span>
                  </div>
                  <div>
                    <span>We threw</span>
                    <span className="font-bold">{dartsStatistics.doorHits}</span>
                    <span>darts in the door</span>
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
    </>
  )
}

export default Home