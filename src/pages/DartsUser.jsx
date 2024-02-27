/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useParams } from 'react-router';
import NavBar from '../components/NavBar'
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {Chart as ChartJS} from "chart.js/auto"
import { Bar } from 'react-chartjs-2';

function DartsUser() {
  const { username } = useParams();
  const [user, setUser] = useState();
  const [userChartData, setUserChartData] = useState();

  useEffect(() => {
    const getUser = async () => {
      const userQ = query(collection(db, 'dartUsers'), where("displayName", "==", username));
      const userQSnapshot = await getDocs(userQ);
      const userQData = userQSnapshot.docs[0].data();
      setUser(userQData);
      console.log(userQData);

      const gamesQ = await getDocs(
        query(collection(db, "dartGames"), where("users", "array-contains", {displayName: "kubek"}))
      );
      const gamesQData = gamesQ.docs.map((doc) => ({ ...doc.data() }));
      console.log(gamesQData);
    }
    getUser();
  }, [username]);

  useEffect(() => {
    if (!user) return;
    setUserChartData({
      labels: Object.keys(user.throws),
      datasets: [{
        label: "Throws",
        data: Object.values(user.throws)
      }]
    })
  }, [user]);

  return (
    <>
      <NavBar />
      <div className='dartUser'>
        <h2>{user?.displayName}</h2>
        <hr />
        <div className='charts'>
          {userChartData && <Bar data={userChartData} />}
        </div>
      </div>
    </>
  )
}

export default DartsUser