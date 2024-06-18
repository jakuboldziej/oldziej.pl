import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/shadcn/button";
import GradualSpacing from "@/components/ui/magicui/gradual-spacing";
import MyParticles from "@/components/Portfolio/MyParticles";
import { LangContext } from "@/context/LangContext";
import { useContext } from "react";
import Navbar from "@/components/Portfolio/Navbar";

function NotFoundPortfolio() {
  const { langText } = useContext(LangContext);
  document.title = langText.notFound?.header;

  const navigate = useNavigate();

  return (
    <div className="notfound-page-wrapper rubik">
      <Navbar isNotFound={true} />
      <MyParticles />
      <div className="notfound-page text-white">
        <span className="text-2xl sm:text-4xl">{langText.notFound?.header}</span>
        {langText.notFound && <GradualSpacing duration={1} className="sm:text-2xl text-[4.9vw]" text={langText.notFound?.lostInSpace}/>}
        <Button onClick={() => navigate("/")} variant="outline_lime">Home</Button>
      </div>
    </div>
  );
};

export default NotFoundPortfolio;