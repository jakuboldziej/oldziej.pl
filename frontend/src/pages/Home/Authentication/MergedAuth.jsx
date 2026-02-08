import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs'
import React, { useContext, useEffect } from 'react'
import Login from './Login'
import Register from './Register'
import { AuthContext } from '@/context/Home/AuthContext'
import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router-dom'

function MergedAuth() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (currentUser) {
      const returnUrl = searchParams.get("returnUrl");
      const decoded = returnUrl ? decodeURIComponent(returnUrl) : null;

      if (decoded && decoded.startsWith("/") && decoded.length > 1) {
        navigate(decoded, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [currentUser, navigate, searchParams]);

  return (
    <div className='text-white container-no-nav flex items-center justify-center'>
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