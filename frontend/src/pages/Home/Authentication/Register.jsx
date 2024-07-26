import { useContext, useEffect, useState } from "react";
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';
import { useNavigate } from "react-router";
import { checkIfUserWithEmailExists, getAuthUser, postDartsUser, postFolder, postFtpUser, registerUser } from "@/fetch";
import { Loader2 } from "lucide-react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { AuthContext } from "@/context/AuthContext";

function Register() {
  document.title = "Oldziej | Register";

  const { currentUser } = useContext(AuthContext);

  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = useSignIn();

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

    setIsLoading(true);

    const existingUser = await getAuthUser(displayName);
    const existingUserWithEmail = await checkIfUserWithEmailExists(email);

    if (existingUser) {
      setErr("User with that username already exists")
      setIsLoading(false);
      return;
    }
    else if (existingUserWithEmail) {
      setErr("User with that email already exists")
      setIsLoading(false);
      return;
    } else {
      await postDartsUser({
        displayName: displayName,
      });
      const folderRes = await postFolder({
        name: "Cloud drive",
        owner: displayName
      });
      await postFtpUser({
        displayName: displayName,
        email: email,
        main_folder: folderRes._id
      });

      const randomNumber = Math.floor(Math.random() * 900) + 100;
      const friendsCode = displayName + randomNumber;
      const userRes = await registerUser({
        email,
        displayName,
        password,
        friendsCode
      });

      signIn({
        auth: {
          token: userRes.token,
          type: "Bearer"
        },
        userState: { displayName: displayName, verified: false }
      });

      navigate("/login");
      setIsLoading(false);
    }
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
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
              {err && <span id="error_message">{err}</span>}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register