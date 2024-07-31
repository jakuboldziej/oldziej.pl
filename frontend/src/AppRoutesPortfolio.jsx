import Zaslepka from '@/components/Portfolio/Zaslepka'
import Home from '@/pages/Portfolio/Home'
import NotFoundPortfolio from '@/pages/Portfolio/NotFoundPortfolio'
import Project from '@/pages/Portfolio/Project'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router'

function AppRoutesPortfolio() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Zaslepka />} />
      </Route>
      <Route path="/test">
        <Route index element={<Home />} />
        <Route path='projects' element={<Navigate to="/test" replace state={{ projectsRedirect: true }} />} />
        <Route path='projects/:projectName' element={<Project />} />
      </Route>
      <Route path="*" element={<NotFoundPortfolio />} />
    </Routes>
  )
}

export default AppRoutesPortfolio