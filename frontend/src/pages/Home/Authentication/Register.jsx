import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { checkIfUserWithEmailExists, getAuthUser, newUserRegisteredEmail, postDartsUser, postFolder, postFtpUser, putFtpUser, registerUser, sendVerificationEmail } from "@/lib/fetch";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { AuthContext } from "@/context/Home/AuthContext";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import Loading from "@/components/Home/Loading";

function Register() {
  document.title = "Oldziej | Register";

  const { setCurrentUser } = useContext(AuthContext);

  const [err, setErr] = useState("");
  const [passErr, setPassErr] = useState("");
  const [passValidate, setPassValidate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const signIn = useSignIn();

  const handlePassword = (e) => {
    const { value } = e.target;
    const isValidPassword = /^(.{0}|.{6,})$/.test(value);

    if (!isValidPassword) {
      if (!passErr) {
        setPassErr("Password must be at least 6 characters long.");
      }
    } else {
      setPassErr("")
    }
    setPassValidate(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const displayName = e.target[0].value
    const email = e.target[1].value;
    const password = e.target[2].value;

    setIsLoading(true);

    try {
      const existingUser = await getAuthUser(displayName);
      const existingUserWithEmail = await checkIfUserWithEmailExists(email);

      if (existingUser) throw new Error("User with that username already exists");
      if (existingUserWithEmail) throw new Error("User with that email already exists");

      const verificationEmail = await sendVerificationEmail({
        userEmail: email
      });

      if (verificationEmail.name && verificationEmail.statusCode) throw new Error(verificationEmail.message);

      const randomNumber = Math.floor(Math.random() * 900) + 100;
      const friendsCode = displayName + randomNumber;

      const userRes = await registerUser({
        email,
        displayName,
        password,
        friendsCode
      });

      signIn({
        auth: {
          token: userRes.token,
          type: "Bearer"
        },
        userState: {
          displayName: displayName,
          verified: userRes.verified,
        },
      });

      await postDartsUser({
        displayName: displayName,
      });

      const ftpUserRes = await postFtpUser({
        displayName: displayName,
        email: email,
      });

      const folderRes = await postFolder({
        name: "Cloud drive",
        ownerId: ftpUserRes._id,
        uploadDate: Date.now()
      });

      await putFtpUser({
        displayName: ftpUserRes.displayName,
        main_folder: folderRes._id
      });

      setCurrentUser({
        displayName: displayName,
        verified: userRes.verified,
      });

      navigate("/", { replace: true });
      setIsLoading(false);

      await newUserRegisteredEmail({
        newUserDisplayName: displayName
      });
    } catch (err) {
      setErr(err.message);
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="johndoe" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Email</Label>
            <Input id="email" type="email" placeholder="johndoe@gmail.com" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="**********" value={passValidate} onChange={handlePassword} required />
            {passErr && <span id="error_message">{passErr}</span>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          {isLoading ? (
            <Loading />
          ) : (
            <Button type="submit" disabled={passValidate.length < 6}>Register</Button>
          )}
          {err && <span id="error_message">{err}</span>}
        </CardFooter>
      </form>
    </Card>
  )
}

export default Register