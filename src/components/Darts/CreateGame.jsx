/* eslint-disable react/prop-types */
import { Card, Form, Modal } from "react-bootstrap"
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function CreateGame({ show, fullscreen, setShow }) {
  const [usersNotPlaying, setUsersNotPlaying] = useState([]);
  const [usersPlaying, setUsersPlaying] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const colRef = collection(db, "users");
        const querySnapshot = await getDocs(colRef);

        const fetchedUsers = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, data: doc.data() });
        });

        setUsersNotPlaying(fetchedUsers);
      } catch (error) {
        console.error("Error getting users: ", error);
      }
    };

    getUsers();
  }, []);

  const handleSelect = (user, action) => {
    if (action === 'add') {
      setUsersPlaying((prevUsersPlaying) => [...prevUsersPlaying, user]);
  
      setUsersNotPlaying((prevUsersNotPlaying) =>
        prevUsersNotPlaying.filter((notPlayingUser) => notPlayingUser.id !== user.id)
      );
    } else if (action === 'del') {
      setUsersPlaying((prevUsersPlaying) =>
        prevUsersPlaying.filter((playingUser) => playingUser.id !== user.id)
      );
  
      setUsersNotPlaying((prevUsersNotPlaying) => [...prevUsersNotPlaying, user]);
    }
  };

  return (
    <>
      <Modal show={show} fullscreen={fullscreen} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Card bg="dark" text="light" style={{ width: '18rem' }}>
          <Card.Header>Add Users</Card.Header>
          <Card.Body>
            <Card.Title>Not Playing</Card.Title>
            <hr />
            <div className="users">
              {usersNotPlaying.map((user) => (
                <div onClick={()=>handleSelect(user, 'add')} className="user" key={user.id}>
                  <span>{user.data.displayName}</span>
                </div>
              ))}
            </div>
            <Card.Title className="mt-3 d-flex justify-content-between">
              Playing
              <Form.Check inline label="Random"/>
            </Card.Title>
            <hr />
            <div className="users">
              {usersPlaying.map((user) => (
                <div onClick={()=>handleSelect(user, 'del')} className="user playing" key={user.id}>
                  <span>{user.data.displayName}</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CreateGame