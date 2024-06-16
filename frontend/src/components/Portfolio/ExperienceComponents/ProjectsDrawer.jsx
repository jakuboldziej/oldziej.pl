import React, { useContext } from 'react';
import { Drawer, DrawerContent, DrawerPortal, DrawerTrigger } from '@/components/ui/shadcn/drawer';
import { Button } from '@/components/ui/shadcn/button';
import Projects from './Projects';
import { LangContext } from '@/context/LangContext';

function ProjectsDrawer() {
  const { langText } = useContext(LangContext);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline_lime">{langText.experience?.button}</Button>
      </DrawerTrigger>
      <DrawerContent className='container_no_nav border-slate-800 backdrop-filter backdrop-blur-sm text-white'>
        <DrawerPortal />
        <Projects />
      </DrawerContent>
    </Drawer>
  )
}

export default ProjectsDrawer