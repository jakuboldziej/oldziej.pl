import NavBar from "@/components/Home/NavBar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Button } from "@/components/ui/shadcn/button";

function NotFound() {
  document.title = "Oldziej | 404 - Not Found";
  const navigate = useNavigate();

  const { currentUser } = useContext(AuthContext);

  return (
    <>
      {currentUser && <NavBar />}
      <div className="notfound-page text-white">
        <span className="text-2xl">404 - Not Found</span>
        {currentUser ? <Button onClick={() => navigate(-1)} variant="outline_green" className="glow-button-green">Back</Button> : <Button onClick={() => navigate('login')} variant="outline_green" className="glow-button-green">Login</Button>}
      </div>
    </>
  );
};

export default NotFound;
