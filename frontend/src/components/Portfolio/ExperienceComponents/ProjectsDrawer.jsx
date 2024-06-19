import React, { useContext, useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/shadcn/drawer';
import { Button } from '@/components/ui/shadcn/button';
import ExperienceProjects from './ExperienceProjects';
import { LangContext } from '@/context/LangContext';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';

function ProjectsDrawer({ params }) {
  const { projectsRedirect, scrolledToProjects } = params;
  const { langText } = useContext(LangContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (scrolledToProjects && projectsRedirect) setDrawerOpen(true);
  }, [scrolledToProjects]);

  const handleOpeningDrawer = (e) => {
    e.preventDefault();
    setDrawerOpen(true);
  }

  return (
    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <DrawerTrigger asChild>
        <Button variant="outline_lime" onClick={(e) => handleOpeningDrawer(e)}>{langText.experience?.button || 'Projects'}</Button>
      </DrawerTrigger>
      <DrawerContent className='container_no_nav border-slate-800 backdrop-filter backdrop-blur-sm text-white'>
      <ScrollArea className="h-full w-full sm:p-10 sm:pt-4 p-4">
        <ExperienceProjects />
      </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default ProjectsDrawer