import { Card, CardContent, CardFooter } from '@/components/ui/shadcn/card'
import React from 'react'
import { Button } from '@/components/ui/shadcn/button'
import { ArrowRightIcon } from 'lucide-react'
import Darts from "@/assets/images/darts.webp"
import Cloud from "@/assets/images/cloud.png"
import Mmagusiak from "@/assets/images/mmagusiak.jpg"
import Hagapolska from "@/assets/images/hagapolska.png"

function ExperienceProjects() {
  return (
    <div className='projects flex flex-wrap justify-center w-full h-full'>
      <div className='projects-wrapper w-fit h-full flex justify-center sm:justify-start flex-wrap gap-10'>
      <Card className='h-fit bg-transparent'>
        <img src={Mmagusiak} alt='projectImg' className='rounded-t-lg sm:h-[318px]' />
        <CardContent className='p-6'>
          <a href='https://mmagusiak.com' target='_blank' className='text-underline-hover'>mmagusiak.com</a>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
            <a href="/projects">
              Show more info
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
      <Card className='w-80 h-fit bg-transparent'>
        <img src={Hagapolska} alt='projectImg' className='rounded-t-lg sm:h-[318px]' />
          <CardContent className='p-6'>
            <a href='https://hagapolska.pl' target='_blank' className='text-underline-hover'>hagapolska.pl</a>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
              <a href="/projects">
                Show more info
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
      </Card>
      {/* <Card className='w-80 h-fit bg-transparent'>
        <img src={Hagapolska} alt='projectImg' className='rounded-t-lg sm:h-[318px]' />
          <CardContent className='p-6'>
            <a href='https://hagapolska.pl' target='_blank' className='text-underline-hover'>military-eagle.pl</a>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
              <a href="/projects">
                Show more info
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
      </Card> */}
      <Card className='w-80 h-fit bg-transparent'>
        <img src={Darts} alt='projectImg' className='rounded-t-lg sm:h-[318px]' />
        <CardContent className='p-6'>
          <a href='https://home.oldziej.pl/darts' target='_blank' className='text-underline-hover'>Darts Web App</a>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
            <a href="/projects">
              Show more info
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
      <Card className='w-80 h-fit bg-transparent'>
        <img src={Cloud} alt='projectImg' className='rounded-t-lg sm:h-[318px]' />
        <CardContent className='p-6'>
          <a href='https://home.oldziej.pl/ftp' target='_blank' className='text-underline-hover'>Cloud Web App</a>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
            <a href="/projects">
              Show more info
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  )
}

export default ExperienceProjects