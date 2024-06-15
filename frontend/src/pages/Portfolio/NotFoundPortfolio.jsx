import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GradualSpacing from "@/components/magicui/gradual-spacing";
import MyParticles from "@/components/Portfolio/MyParticles";

function NotFoundPortfolio() {
  document.title = "Oldziej | 404 - Not Found";
  const navigate = useNavigate();

  return (
    <>
      <MyParticles />
      <div className="notfound-page text-white">
        <span className="text-4xl">404 - Not Found</span>
        <GradualSpacing duration={1} className="text-2xl" text="Seems like you got lost in space..."/>
        <Button onClick={() => navigate(-1)} variant="outline_lime" className="glow-button-lime">Back</Button>
      </div>
    </>
  );
};

export default NotFoundPortfolio;
