import NavBar from "@/components/NavBar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";

const NotFound = () => {
  document.title = "Oldziej | 404 - Not Found";
  const navigate = useNavigate();
  
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      {currentUser && <NavBar />}
      <div className="notfound-page text-white">
        <h1>404 - Not Found</h1>
        {currentUser ? <Button onClick={() => navigate(-1)} variant="outline_green" className="glow-button-green">Back</Button> : <Button onClick={() => navigate('login')} variant="outline_green" className="glow-button-green">Login</Button>}
      </div>
    </>
  );
};

export default NotFound;
