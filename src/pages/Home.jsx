import { useEffect, useState } from "react";
import NavBar from "../components/NavBar"
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Home() {
  document.title = "HomeServer";

  const [dartUsers, setDartUsers] = useState([]);

  useEffect(() => {
    const getDartUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'dartUsers'));
      const gamesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedUsers = gamesData.slice().sort((a, b) => {
        const firstPlaceA = a.podiums["firstPlace"];
        const firstPlaceB = b.podiums["firstPlace"];

        return firstPlaceB - firstPlaceA;
      });
      setDartUsers(sortedUsers);
    }
    getDartUsers();
  }, []);

  return (
    <>
      <NavBar />
      <div className='home-page'>
        <div className="cards">
          <div className="myCard darts">
            <span>
              <h3>Darts</h3>
            </span>
            <div className="info">
              <div className="myCard miniCard leaderboard">
                <span>
                  <h3>Leaderboard</h3>
                </span>
                <div className="info">
                  {dartUsers && dartUsers.map((dartUser) => {
                    return (
                      <div key={dartUser.id} className="element">
                        <span className="username">{dartUser.displayName}</span>
                        <span>
                          <img width="20" height="20" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
                          {dartUser.podiums["firstPlace"]}
                        </span>
                        <span>
                          <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                          {dartUser.throws["doors"]}
                        </span>
                        <span>
                          <img width="20" height="20" src="https://img.icons8.com/color/20/goal--v1.png" alt="goal--v1" />
                          {dartUser.gamesPlayed}
                        </span>
                        <span>
                          <img width="20" height="20" src="https://img.icons8.com/arcade/20/graph.png" alt="graph"/>
                          <h6 style={{fontSize: 13}}>{dartUser.highestEndingAvg}</h6>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="myCard chat">
            <span>
              <h3>Chat</h3>
            </span>
            <div className="info">

            </div>
          </div>
          <div className="myCard FTP">
            <span>
              <h3>FTP</h3>
            </span>
            <div className="info">

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home