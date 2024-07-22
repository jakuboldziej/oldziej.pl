import { useParams } from 'react-router';
import NavBar from '@/components/Home/NavBar'
import { useEffect, useState } from 'react';
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Line } from 'react-chartjs-2';
import { getDartsGames, getDartsUser } from '@/fetch';
import { Loader2 } from 'lucide-react';

function DartsUser() {
  const { username } = useParams();
  document.title = `Oldziej | ${username}`
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState(50);

  const [chartThrowsOverall, setChartThrowsOverall] = useState();
  const [chartThrowsDates, setChartThrowsDates] = useState();
  const [chartSpecialData, setChartSpecialData] = useState();
  const [chartPodiums, setChartPodiums] = useState();
  const [gamesShown, setGamesShown] = useState([]);
  const [games, setGames] = useState([])


  useEffect(() => {
    const getUser = async () => {
      const userQ = await getDartsUser(username)
      userQ.throws = {
        normal: userQ.throws.normal,
        triples: userQ.throws.triples,
        doubles: userQ.throws.doubles,
        doors: userQ.throws.doors,
        overthrows: userQ.throws.overthrows,
      }
      setUser(userQ);

      const games = await getDartsGames(userQ.displayName, 10);
      setGamesShown(games)
      setUser((prev) => ({ ...prev, games: games }));
      setIsLoading(false);
    }
    getUser();
  }, [username]);

  useEffect(() => {
    const fetchAllData = async () => {
      const fetchedGames = await getDartsGames(user.displayName);
      setGames(fetchedGames);
    }
    if (gamesShown.length === 10) {
      fetchAllData()
    }
  }, [gamesShown]);

  useEffect(() => {
    if (!user || !user.games) return;

    // Adding data to charts
    setChartThrowsOverall({
      labels: Object.keys(user.throws),
      datasets: [{
        label: "Throws",
        data: Object.values(user.throws)
      }]
    })
    const userThrows = Object.values(user.games.map((game) => game.users.find((user) => user.displayName === username).throws));
    const userNormalThrows = userThrows.map((throws) => throws.normal);
    const userDoublesThrows = userThrows.map((throws) => throws.doubles);
    const userTriplesThrows = userThrows.map((throws) => throws.triples);
    const userDoorsThrows = userThrows.map((throws) => throws.doors);
    const userOverthrowsThrows = userThrows.map((throws) => throws?.overthrows ?? 0);
    const userAllThrows = userThrows.map((throws) => Object.values(throws).reduce((acc, value) => acc + value, 0));

    let previousDate = 0;
    let dateCounter = 2;
    setChartThrowsDates({
      labels: user.games.map((game) => {
        let date = new Date(game.created_at).toLocaleDateString();
        if (previousDate === date) {
          date = date + ` (${dateCounter})`;
          dateCounter += 1;
        } else {
          dateCounter = 2;
          previousDate = date;
        }
        return date;
      }),
      datasets: [
        {
          label: "All Throws",
          data: userAllThrows,
          tension: 0.3
        },
        {
          label: "Normal throws",
          data: userNormalThrows,
          tension: 0.3
        },
        {
          label: "Double throws",
          data: userDoublesThrows,
          tension: 0.3
        },
        {
          label: "Triple throws",
          data: userTriplesThrows,
          tension: 0.3
        },
        {
          label: "Door throws",
          data: userDoorsThrows,
          tension: 0.3
        },
        {
          label: "Over Throws",
          data: userOverthrowsThrows,
          tension: 0.3
        }]
    })

    const userHRP = user.games.map((game) => game.users.find((user) => user.displayName === username)?.highestTurnPoints ?? 0);
    const userAVG = user.games.map((game) => game.users.find((user) => user.displayName === username).avgPointsPerTurn);

    setChartSpecialData({
      labels: user.games.map((game) => {
        let date = new Date(game.created_at).toLocaleDateString();
        if (previousDate === date) {
          date = date + ` (${dateCounter})`;
          dateCounter += 1;
        } else {
          dateCounter = 2;
          previousDate = date;
        }
        return date;
      }),
      datasets: [
        {
          label: "Highest Round Points",
          data: userHRP,
          tension: 0.3
        },
        {
          label: "AVG per turn",
          data: userAVG,
          tension: 0.3
        },
      ]
    })
  }, [user]);

  return (
    <>
      <NavBar />
      <div className='dart-user'>
        <div className='header'>
          <b className='text-2xl'>{user?.displayName}</b>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-5 gap-2">
            <Loader2 className="h-10 w-10 animate-spin" />
            <div>Loading Statistics...</div>
          </div>
        ) :
          <>
            <div className='overall-stats'>

            </div>
            <div className='charts'>
              {chartThrowsOverall &&
                // <div>
                //   <Bar data={chartThrowsOverall} />
                //   <div className='options'>
                //     <Form.Check inline type="radio" label={
                //       <span style={{ display: 'flex', alignItems: 'center' }}>
                //         <img width="64" height="64" src="https://img.icons8.com/color/64/bar-chart--v1.png" alt="bar-chart--v1" />
                //       </span>
                //     }
                //     />
                //     <Form.Check inline type="radio" label={
                //       <span style={{ display: 'flex', alignItems: 'center' }}>
                //         <img width="64" height="64" src="https://img.icons8.com/dusk/64/chart.png" alt="chart" />
                //       </span>
                //     }
                //     />
                //     <div className='d-flex flex-column'>
                //       <Form.Label>Range {range}</Form.Label>
                //       <Form.Range value={range} onChange={(event) => setRange(event.target.value)} />
                //     </div>
                //   </div>
                // </div>
                <div>asdf</div>
              }
              {chartThrowsDates &&
                <div>
                  <Line data={chartThrowsDates} />
                </div>}
              {chartSpecialData &&
                <div>
                  <Line data={chartSpecialData} />
                </div>
              }
            </div>
          </>}
      </div>
    </>
  )
}

export default DartsUser