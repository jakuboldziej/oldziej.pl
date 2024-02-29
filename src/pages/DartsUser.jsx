/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useParams } from 'react-router';
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react';
import { FieldPath, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Line } from 'react-chartjs-2';

function DartsUser() {
  const { username } = useParams();
  const [user, setUser] = useState();
  const [chartThrowsOverall, setChartThrowsOverall] = useState();
  const [chartThrowsDates, setChartThrowsDates] = useState();
  const [chartSpecialData, setChartSpecialData] = useState();

  useEffect(() => {
    const getUser = async () => {
      const userQ = query(collection(db, 'dartUsers'), where("displayName", "==", username));
      const userQSnapshot = await getDocs(userQ);
      const userQData = userQSnapshot.docs[0].data();
      userQData.throws = {
        normal: userQData.throws.normal,
        triples: userQData.throws.triples,
        doubles: userQData.throws.doubles,
        doors: userQData.throws.doors,
        overthrows: userQData.throws.overthrows,
      }
      setUser(userQData);

      const gamesQ = await getDocs(
        query(collection(db, "dartGames"))
      );

      const gamesQData = gamesQ.docs.map((doc) => ({ ...doc.data() }));
      const filteredGames = gamesQData.filter((game) => game.users.some((user) => user.displayName === username));
      setUser((prev) => ({ ...prev, games: filteredGames }));
    }
    getUser();
  }, [username]);

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

    setChartThrowsDates({
      labels: user.games.map((game) => {
        const date = new Date(Number(game.created_at));
        return date.toLocaleDateString();
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
        const date = new Date(Number(game.created_at));
        return date.toLocaleDateString();
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
      <div className='dartUser'>
        <div className='header'>
          <h2>{user?.displayName}</h2>
          <hr />
        </div>
        <div className='charts'>
          {chartThrowsOverall && <Bar data={chartThrowsOverall} />}
          {chartThrowsDates && <Line data={chartThrowsDates} />}
          {chartSpecialData && <Line data={chartSpecialData} />}
        </div>
      </div>
    </>
  )
}

export default DartsUser