import MyParticles from '@/components/Portfolio/MyParticles'
import Navbar from '@/components/Portfolio/Navbar'
import { useNavigate, useParams } from 'react-router';
import ImgMmagusiak from "@/assets/images/Portfolio/ProjectsImages/mmagusiak.png"
import ImgMmagusiakMobile from "@/assets/images/Portfolio/ProjectsImages/mmagusiak_mobile.png"
import ImgDarts from "@/assets/images/Portfolio/ProjectsImages/darts.png"
import ImgDartsMobile from "@/assets/images/Portfolio/ProjectsImages/darts_mobile.png"
import ImgOldziej from "@/assets/images/Portfolio/ProjectsImages/oldziej.png"
import ImgOldziejMobile from "@/assets/images/Portfolio/ProjectsImages/oldziej_mobile.png"
import ImgCloud from "@/assets/images/Portfolio/ProjectsImages/cloud.png"
import ImgCloudMobile from "@/assets/images/Portfolio/ProjectsImages/cloud_mobile.png"
import ImgPromaxSport from "@/assets/images/Portfolio/ProjectsImages/promaxsport.png"
import ImgPromaxSportMobile from "@/assets/images/Portfolio/ProjectsImages/promaxsport_mobile.png"
import ImgMyo from "@/assets/images/Portfolio/ProjectsImages/myo.png"
import ImgMyoMobile from "@/assets/images/Portfolio/ProjectsImages/myo_mobile.png"
import ImgMilitaryEagle from "@/assets/images/Portfolio/ProjectsImages/military-eagle.png"
import ImgMilitaryEagleMobile from "@/assets/images/Portfolio/ProjectsImages/military-eagle_mobile.png"
import MagicUiIcon from "@/assets/images/icons/magicui_icon.png"
import LucideIcon from "@/assets/images/icons/lucide_icon.svg"
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { SiBootstrap, SiChartdotjs, SiExpress, SiFirebase, SiFramer, SiGoogleanalytics, SiIcons8, SiLeaflet, SiMongodb, SiNextdotjs, SiReact, SiResend, SiSanity, SiSass, SiShadcnui, SiSimpleicons, SiSocketdotio, SiStripe, SiTailwindcss, SiZod } from '@icons-pack/react-simple-icons';
import { PortfolioContext } from '@/context/Portfolio/PortfolioContext';
import { scrollToTop } from '@/components/Portfolio/utils';

function Project() {
  const { langText } = useContext(PortfolioContext);
  const { projectName } = useParams();

  const navigate = useNavigate();

  const isMobile = window.innerWidth < 640;

  const [mainImage, setMainImage] = useState(null);
  const [mainLink, setMainLink] = useState({ text: '', href: '' });
  const [designedBy, setDesignedBy] = useState('');
  const [techStackIcons, setTechStackIcons] = useState([]);

  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (projectName === "promaxsport") {
      setMainImage(isMobile ? ImgPromaxSportMobile : ImgPromaxSport);
      setMainLink({ text: "promaxsport.pl", href: 'https://promaxsport.pl' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiGoogleanalytics key={'#E37400'} width={46} height={46} fill='#E37400' />
      ]);
    } else if (projectName === "mmagusiak") {
      setMainImage(isMobile ? ImgMmagusiakMobile : ImgMmagusiak);
      setMainLink({ text: "www.mmagusiak.com", href: 'https://www.mmagusiak.com' });
      setDesignedBy('Mateusz Magusiak')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiBootstrap key={'#7952B3'} width={46} height={46} fill='#7952B3' />,
        <SiSanity key={'#F03E2F'} width={46} height={46} fill='#F03E2F' />,
        <SiFirebase key={'#DD2C00'} width={46} height={46} fill='#DD2C00' />,
        <SiGoogleanalytics key={'#E37400'} width={46} height={46} fill='#E37400' />
      ]);
    } else if (projectName === "darts") {
      setMainImage(isMobile ? ImgDartsMobile : ImgDarts);
      setMainLink({ text: "home.oldziej.pl/darts", href: 'https://home.oldziej.pl/darts' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiExpress key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiSocketdotio key={'#FFFFFF2'} width={46} height={46} fill='#FFFFFF' />,
        <SiMongodb key={'#47A248'} width={46} height={46} fill='#47A248' />,
        <SiResend key={'#FFFFFF3'} width={46} height={46} fill='#FFFFFF' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiIcons8 key={'#1FB141'} width={46} height={46} fill='#1FB141' />,
        <img key='lucide-react' title='lucide-react' alt='lucide-react' src={LucideIcon} width={46} height={46} />,
        <SiChartdotjs key={'#FF6384'} width={46} height={46} fill='#FF6384' />,
      ]);
    } else if (projectName === "cloud") {
      setMainImage(isMobile ? ImgCloudMobile : ImgCloud);
      setMainLink({ text: "home.oldziej.pl/cloud", href: 'https://home.oldziej.pl/cloud' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiExpress key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiSocketdotio key={'#FFFFFF2'} width={46} height={46} fill='#FFFFFF' />,
        <SiMongodb key={'#47A248'} width={46} height={46} fill='#47A248' />,
        <SiResend key={'#FFFFFF3'} width={46} height={46} fill='#FFFFFF' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <img key='lucide-react' title='lucide-react' alt='lucide-react' src={LucideIcon} width={46} height={46} />,
      ]);
    } else if (projectName === "oldziej") {
      setMainImage(isMobile ? ImgOldziejMobile : ImgOldziej);
      setMainLink({ text: "oldziej.pl", href: 'https://oldziej.pl' });
      setDesignedBy('Jakub Ołdziejewski')
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiSass key={'#CC6699'} width={46} height={46} fill='#CC6699' />,
        <SiShadcnui key={'#ffffff'} width={46} height={46} fill='#ffffff' />,
        <img key={'magicui'} title='magicui' alt='magicui' src={MagicUiIcon} width={46} height={46} />,
        <SiSimpleicons key={'#FFFFFF'} width={46} height={46} fill='#FFFFFF' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiGoogleanalytics key={'#E37400'} width={46} height={46} fill='#E37400' />
      ]);
    } else if (projectName === "myopilatesstudio") {
      setMainImage(isMobile ? ImgMyoMobile : ImgMyo);
      setMainLink({ text: "myopilatesstudio.pl", href: 'https://myopilatesstudio.pl' });
      setDesignedBy('Jakub Ołdziejewski');
      setTechStackIcons([
        <SiReact key={'#61DAFB'} width={46} height={46} fill='#61DAFB' />,
        <SiTailwindcss key={'#06B6D4'} width={46} height={46} fill='#06B6D4' />,
        <SiFramer key={'#0055FF'} width={46} height={46} fill='#0055FF' />,
        <SiGoogleanalytics key={'#E37400'} width={46} height={46} fill='#E37400' />,
        <img key='lucide-react' title='lucide-react' alt='lucide-react' src={LucideIcon} width={46} height={46} />
      ]);
    } else if (projectName === "military-eagle") {
      setMainImage(isMobile ? ImgMilitaryEagleMobile : ImgMilitaryEagle);
      setMainLink({ text: "military-eagle.com", href: 'https://military-eagle.com' });
      setDesignedBy('Jakub Ołdziejewski');
      setTechStackIcons([
        <SiNextdotjs key={'#FFFFFF'} title="Next.js 16" width={46} height={46} fill='#FFFFFF' />,
        <SiReact key={'#61DAFB'} title="React 19" width={46} height={46} fill='#61DAFB' />,
        <SiTailwindcss key={'#06B6D4'} title="Tailwind CSS" width={46} height={46} fill='#06B6D4' />,
        <SiFramer key={'#0055FF'} title="Framer Motion" width={46} height={46} fill='#0055FF' />,
        <SiMongodb key={'#47A248'} title="MongoDB" width={46} height={46} fill='#47A248' />,
        <SiSanity key={'#F03E2F'} title="Sanity CMS" width={46} height={46} fill='#F03E2F' />,
        <SiStripe key={'#008CDD'} title="Stripe" width={46} height={46} fill='#008CDD' />,
        <SiZod key={'#3E67B1'} title="Zod" width={46} height={46} fill='#3E67B1' />,
        <img key='lucide-react' title='lucide-react' alt='lucide-react' src={LucideIcon} width={46} height={46} />
      ]);
    } else {
      setIsNotFound(true);
    }
  }, [projectName]);

  useEffect(() => {
    document.title = "Oldziej | " + mainLink.text;
  }, [mainLink]);

  useLayoutEffect(() => {
    scrollToTop(0, 'instant');
  }, [])

  if (isNotFound) {
    return (
      <div className='project-portfolio rubik'>
        <Navbar isNotHome={true} isProjects={true} />
        <MyParticles />
        <div className="flex-1 flex items-center justify-center min-h-[70vh] text-white flex-col gap-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground">Nie znaleziono takiego projektu.</p>
          <Button variant="outline_lime" onClick={(e) => navigate("/projects")}>{langText.experience?.button || 'Projects'}</Button>
        </div>
      </div>
    );
  }

  if (!mainImage) return null;

  return (
    <div className='project-portfolio rubik'>
      <Navbar isNotHome={true} isProjects={true} />
      <MyParticles />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className='project-portfolio-content relative text-2xl mt-[64px] p-5 pt-0 sm:p-[3vw] sm:pt-0 text-white flex flex-col gap-10'
      >

        <img alt={mainImage} src={mainImage} />
        <Button
          title={mainLink.href}
          onClick={() => window.open(mainLink.href)}
          variant='outline_white'
          className='flex items-center gap-3 w-fit'
        >
          {mainLink.text}
          <SquareArrowOutUpRight />
        </Button>
        <span className='flex flex-wrap gap-2'>
          <div className='font-bold'>{langText.project?.designedBy}</div>
          <div>{designedBy}</div>
        </span>
        <div className='flex flex-col'>
          <span className='font-bold'>Tech Stack:</span>
          <div className='icons flex flex-row flex-wrap gap-5 pt-5'>
            {techStackIcons}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Project