import { Card, CardContent, CardFooter } from '@/components/ui/shadcn/card'
import { Button } from '@/components/ui/shadcn/button'
import { useContext } from 'react';
import { PortfolioContext } from '@/context/Portfolio/PortfolioContext';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function ProjectCard({ image, link, linkText, redirect }) {
  const { langText } = useContext(PortfolioContext);

  return (
    <Card className='w-[320px] h-[452px] bg-transparent'>
      <div className={`h-[318px] flex items-center aspect-square`}>
        <img src={image} alt='projectImg' className='pointer-events-none rounded-t-lg w-full aspect-auto' />
      </div>
      <CardContent className='p-6'>
        <Link to={link} target='_blank' className='text-underline-hover'>{linkText}</Link>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <Link to={redirect}>
            {langText.experience?.projectButton}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProjectCard