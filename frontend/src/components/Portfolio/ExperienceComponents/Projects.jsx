import { Card, CardContent, CardFooter } from '@/components/ui/shadcn/card'
import React from 'react'
import { Button } from '@/components/ui/shadcn/button'
import { ArrowRightIcon } from 'lucide-react'
import Darts from "@/assets/images/darts.webp"

function Projects() {
  return (
    <div className='projects flex flex-wrap pt-[16px] h-full'>
      <Card className='w-80 h-fit bg-transparent'>
        <img src={Darts} alt='projectImg' className='rounded-t-lg' />
        <CardContent className='p-6'>
          <p>Card Content</p>
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
  )
}

export default Projects