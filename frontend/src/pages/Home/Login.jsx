import { useContext, useEffect, useState } from "react";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router";
import "@/styles/home.scss"
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';
import { AuthContext } from "@/context/AuthContext";
import { getUser } from "@/fetch";
import { Loader2  } from "lucide-react";

function Login() {
  document.title = "Oldziej | Login";

  const { currentUser } = useContext(AuthContext);
  const [err, setErr] = useState("");
  const [passErr, setPassErr] = useState("");
  const [passValidate, setPassValidate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [borderBottomColor, setBorderBottomColor] = useState("#fff");
  const dynamicBorderStyle = {"--border-bottom-color": borderBottomColor};
  const navigate = useNavigate();

  // Redirect when already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/")
    }
  }, [currentUser, navigate]);

  const handleError = (message, color) => {
    setErr(message);
    setBorderBottomColor(color);
  }

  const handlePassword = (e) => {
    const { value } = e.target;
    const isValidPassword = /^(.{0}|.{6,})$/.test(value);

    if (!isValidPassword) {
      if(!passErr) {
        setPassErr("Password must be at least 6 characters long.");
        setBorderBottomColor("rgb(248, 126, 126)");
      } 
    } else {
      setPassErr("")
      setBorderBottomColor("#fff");
    }
    setPassValidate(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const displayName = e.target[0].value
    const password = e.target[1].value;

    try {
      setIsLoading(true);
      const userQ = await getUser(displayName);

      if (!userQ.empty) {
        await signInWithEmailAndPassword(auth, userQ.email, password);
        navigate("/");
      } else {
        handleError("User doesn't exist.", "rgb(248, 126, 126)")
      }
      setIsLoading(false);
    } catch (err) {
      handleError("Wrong password.", "rgb(248, 126, 126)")
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="login-page">
        <div className="container-login100">
          <div className="wrap-login100">
            <form className="login100-form validate-form" onSubmit={handleSubmit}>
              <span className="login100-form-title p-b-34 p-t-27">
                Log in
              </span>
              <div className="wrap-input100 validate-input" style={dynamicBorderStyle} data-validate="Enter username">
                <input className="input100" type="text" name="username" placeholder="Username" required />
                <span className="focus-input100" data-placeholder="&#xf207;"></span>
              </div>
              <div className="wrap-input100 validate-input" style={dynamicBorderStyle} data-validate="Enter password">
                <input className="input100" type="password" name="pass" placeholder="Password" required onChange={handlePassword} value={passValidate}/>
                <span className="focus-input100" data-placeholder="&#xf191;"></span>
                {passErr && <span className="pass-error">{passErr}</span>}
              </div>
              <div className="container-login100-form-btn">
                <button className="login100-form-btn">
                  Login
                </button>
              </div>
              <div className={isLoading ? "flex justify-center pt-3" : "hidden"}>
                <Loader2 className="h-10 w-10 animate-spin"/>
              </div>
              {err && <span id="error_message">{err}</span>}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login