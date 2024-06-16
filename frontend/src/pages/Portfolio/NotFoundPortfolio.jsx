import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GradualSpacing from "@/components/magicui/gradual-spacing";
import MyParticles from "@/components/Portfolio/MyParticles";
import { LangContext } from "@/context/LangContext";
import { useContext } from "react";

function NotFoundPortfolio() {
  const { langText } = useContext(LangContext);
  document.title = langText.notFound?.header;

  const navigate = useNavigate();

  return (
    <>
      <MyParticles />
      <div className="notfound-page text-white">
        <span className="text-4xl">{langText.notFound?.header}</span>
        {langText.notFound && <GradualSpacing duration={1} className="text-2xl" text={langText.notFound?.lostInSpace}/>}
        <Button onClick={() => navigate(-1)} variant="outline_lime" className="glow-button-lime">{langText.notFound?.button}</Button>
      </div>
    </>
  );
};

export default NotFoundPortfolio;
