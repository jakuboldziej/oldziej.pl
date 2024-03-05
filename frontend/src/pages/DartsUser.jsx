import { useParams } from 'react-router';
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Line } from 'react-chartjs-2';
import { getDartsGames, getDartsUser } from '../fetch';

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
      console.log(gamesShown.length);
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

    const userHRP = user.games.map((game) => game.users.find((user) => user.displayName === username)?.highestRoundPoints ?? 0);
    const userAVG = user.games.map((game) => game.users.find((user) => user.displayName === username).avgPointsPerThrow);

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
          <h2>{user?.displayName}</h2>
          <hr />
        </div>
        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center mt-5 gap-2">
            {/* <MySpinner /> */}
            Loading Statistics...
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