import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { loginUser } from "@/lib/fetch";
import { AuthContext } from "@/context/Home/AuthContext";
import { useSearchParams } from "react-router-dom";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import Loading from "@/components/Home/Loading";

function Login() {
  document.title = "Oldziej | Login";

  const { setCurrentUser } = useContext(AuthContext);

  const [err, setErr] = useState("");
  const signIn = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const displayName = e.target[0].value
    const password = e.target[1].value;

    setIsLoading(true);

    const response = await loginUser({
      displayName,
      password
    });
    if (!response.token) {
      setErr(response.message)
      setIsLoading(false);
      return;
    }


    signIn({
      auth: {
        token: response.token,
        type: "Bearer"
      },
      userState: {
        displayName: displayName,
        verified: response.verified,
        role: response.role
      },
    });

    setCurrentUser({
      displayName: displayName,
      verified: response.verified,
      role: response.role
    });

    if (searchParams.get("returnUrl")) {
      navigate(searchParams.get("returnUrl"), { replace: true });
    } else {
      navigate("/", { replace: true });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => {
        setErr("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [err]);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="johndoe" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="**********" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          {isLoading ? (
            <Loading />
          ) : (
            <Button type="submit">Login</Button>
          )}
          {err && <span id="error_message">{err}</span>}
        </CardFooter>
      </form>
    </Card>
  )
}

export default Login