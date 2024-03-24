import { useContext, useEffect, useState } from "react";
import "../style.scss"
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { postUser, postDartsUser } from "../fetch";
import { Loader2 } from "lucide-react";

function Register() {
  document.title = "Oldziej | Register";
  
  const { currentUser } = useContext(AuthContext);
  const [err, setErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      user ? await updateProfile(user, {displayName: displayName}) : null
      
      try {
        await postUser({
          displayName: user.displayName,
          email: user.email
        });
        await postDartsUser({
          displayName: user.displayName,
          gamesPlayed: 0,
          podiums: {
            firstPlace: 0,
            secondPlace: 0,
            thirdPlace: 0
          },
          overAllPoints: 0,
          highestEndingAvg: 0,
          highestOuts: 0,
          highestRoundPoints: 0,
          throws: {
            normal: 0,
            doubles: 0,
            tripes: 0,
            overthrows: 0,
            doors: 0
          }
        });
      } catch (err) {
        console.log("Error fetching", err);
      }

      navigate("/login");
    } catch (err) {
      console.log(err)
      setErr(true);
    }
    setIsLoading(false);
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
              <div className={isLoading ? "flex justify-center pt-3" : "hidden"}>
                <Loader2 className="h-10 w-10 animate-spin"/>
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