import React from 'react'

function Projects({ projectsRef }) {
  return (
    <section ref={projectsRef} id='projects' className='pointer-events-none'>
      <div className='portfolio-projects w-full flex flex-col justify-evenly mt-[64px]'>
        Projects
      </div>
    </section>
  )
}

export default Projects