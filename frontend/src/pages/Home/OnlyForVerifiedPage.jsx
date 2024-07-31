import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/Home/AuthContext";
import { useContext, useEffect } from "react";
import { Button } from "@/components/ui/shadcn/button";

function OnlyForVerifiedPage() {
  document.title = "Oldziej | Not Verified User";
  const navigate = useNavigate();

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser.verified) {
      navigate(-1);
    }
  }, [currentUser]);

  return (
    <div className="verified-page text-white">
      <span className="text-2xl">You need to be verified!</span>
      <Button onClick={() => navigate("/")} variant="outline_green" className="glow-button-green">Home</Button>
    </div>
  );
};

export default OnlyForVerifiedPage;
