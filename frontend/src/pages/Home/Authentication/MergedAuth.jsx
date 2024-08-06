import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs'
import React, { useContext, useEffect } from 'react'
import Login from './Login'
import Register from './Register'
import { AuthContext } from '@/context/Home/AuthContext'
import { useNavigate } from 'react-router'

function MergedAuth() {
  const { currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  // Redirect when already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/")
    }
  }, [currentUser, navigate]);

  return (
    <div className='text-white h-screen flex items-center justify-center p-2'>
      <Tabs defaultValue="account" className="w-[450px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Login</TabsTrigger>
          <TabsTrigger value="password">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Login />
        </TabsContent>
        <TabsContent value="password">
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MergedAuth