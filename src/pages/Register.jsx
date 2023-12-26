import { useContext, useEffect, useState } from "react";
import "../style.scss"
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

function Register() {
  document.title = "HomeServer | Register";
  
  const { currentUser } = useContext(AuthContext);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect when already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/")
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const displayName = e.target[0].value
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      user ? await updateProfile(user, {displayName: displayName}) : null
      
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName,
        email
      });
      await setDoc(doc(db, "dartUsers", res.user.uid), {
        uid: res.user.uid,
        displayName,
        wins: 0,
      });

      const q = await getDocs(collection(db, "users"));
      const users = q.docs.map((doc) => ({...doc.data()}));

      await setDoc(doc(db, "userChats", user.uid), {});

      if(users) {
        users.map(async(userQ) => {
          if (userQ.displayName === user.displayName) {
            return;
          }
          const combinedId = user.uid > userQ.uid ? user.uid + userQ.uid : userQ.uid + user.uid;
          
          await setDoc(doc(db, "chats", combinedId), { messages: [] });
          await setDoc(doc(db, "userChats", user.uid), {});
          await updateDoc(doc(db, "userChats", user.uid), {
            [combinedId]: {
              userInfo: {
                uid: userQ.uid,
                displayName: userQ.displayName,
              },
              date: serverTimestamp(),
              read: true,
            }
          });
          try{
            console.log('created from other users to this user')
            await updateDoc(doc(db, "userChats", userQ.uid), {
              [combinedId]: {
                userInfo: {
                  uid: user.uid,
                  displayName: user.displayName,
                },
                date: serverTimestamp(),
                read: true,
              }
            });
          } catch (err) {
            console.log(err)
          }
        });
      }

      navigate("/login");
    } catch (err) {
      console.log(err)
      setErr(true);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="register-page">
        <div className="container-login100">
          <div className="wrap-login100">
            <form className="login100-form validate-form" onSubmit={handleSubmit}>
              <span className="login100-form-title p-b-34 p-t-27">
                Register
              </span>
              <div className="wrap-input100 validate-input" data-validate="Enter username">
                <input className="input100" type="text" name="username" placeholder="Username" required />
                <span className="focus-input100" data-placeholder="&#xf207;"></span>
              </div>
              <div className="wrap-input100 validate-input" data-validate="Enter email">
                <input className="input100" type="email" name="email" placeholder="Email" required />
                <span className="focus-input100" data-placeholder="&#xf207;"></span>
              </div>
              <div className="wrap-input100 validate-input" data-validate="Enter password">
                <input className="input100" type="password" name="pass" placeholder="Password" required />
                <span className="focus-input100" data-placeholder="&#xf191;"></span>
              </div>
              <div className="container-login100-form-btn">
                <button className="login100-form-btn">
                  Register
                </button>
              </div>
              <div className={loading ? "d-flex justify-content-center pt-3" : "d-none"}>
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
              {err && <span id="error_message">Something went wrong.</span>}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register