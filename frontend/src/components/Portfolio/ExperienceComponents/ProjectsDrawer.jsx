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

  return (
    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <DrawerTrigger asChild>
        <Button variant="outline_lime" onClick={() => setDrawerOpen(true)}>{langText.experience?.button}</Button>
      </DrawerTrigger>
      <DrawerContent className='container_no_nav border-slate-800 backdrop-filter backdrop-blur-sm text-white'>
      <ScrollArea className="h-full w-full sm:p-10 p-4 pt-4">
        <ExperienceProjects />
      </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default ProjectsDrawer