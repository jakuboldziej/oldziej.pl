import React from 'react';
import IconClouds from './ExperienceComponents/IconClouds';
import ProjectsDrawer from './ExperienceComponents/ProjectsDrawer';

function Experience({ experienceRef }) {
  return (
    <section ref={experienceRef} id='experience'>
      <div className='portfolio-experience w-full flex flex-col items-center justify-evenly gap-20 sm:gap-0 pb-20 sm:pb-0'>
        <ProjectsDrawer />
        <div className='flex flex-col items-center gap-20'>
          <IconClouds />
        </div>
      </div>
    </section>
  )
}

export default Experience