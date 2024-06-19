import { Card, CardContent, CardFooter } from '@/components/ui/shadcn/card'
import { Button } from '@/components/ui/shadcn/button'
import { useContext } from 'react';
import { LangContext } from '@/context/LangContext';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function ProjectCard({ image, link, linkText, redirect }) {
  const { langText } = useContext(LangContext);

  return (
    <Card className='w-[320px] h-fit bg-transparent'>
      <img src={image} alt='projectImg' className='rounded-t-lg w-full' />
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