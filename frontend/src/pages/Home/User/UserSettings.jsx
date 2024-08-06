import Loading from "@/components/Home/Loading";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { AuthContext } from "@/context/Home/AuthContext";
import { getAuthUser } from "@/fetch";
import { useContext, useEffect, useState } from "react";

function UserSettings() {
  document.title = "Oldziej | Settings";

  const { currentUser } = useContext(AuthContext);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [controlValueChange, setControlValueChange] = useState({
    email: false,
    password: false
  });

  const handleVerifiedUser = () => {
    if (currentUser.verified) return true;
    else return false;
  }

  const handleChangeButton = (type) => {
    if (type === "email") {
      setControlValueChange((prev) => ({
        ...prev,
        email: email
      }));
    } else if (type === "password") {
      setControlValueChange((prev) => ({
        ...prev,
        password: password
      }));
    }
    console.log(type);
  }

  useEffect(() => {
    const fetchAuthUser = async () => {
      const fetchedAuthUser = await getAuthUser(currentUser.displayName);

      setAuthUser(fetchedAuthUser);

      setIsLoading(false);
    }

    fetchAuthUser();
  }, []);

  if (isLoading) {
    return (
      <Loading />
    )
  } else {
    return (
      <div className='settings text-white flex flex-col gap-10'>
        <span className="text-5xl p-12">Settings {!handleVerifiedUser() && <span>(Verify your email)</span>}</span>
        <div className="forms px-12 flex flex-col gap-10">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" id="email"
                defaultValue={authUser.email}
                readOnly
              />
              <Button disabled={!handleVerifiedUser()} onClick={() => handleChangeButton("email")}>Change</Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="password" id="password"
                defaultValue="**********"
                readOnly
              />
              <Button disabled={!handleVerifiedUser()} onClick={() => handleChangeButton("password")}>Change</Button>
            </div>
          </div>
        </div>
        <Button type="submit" className="w-fit absolute bottom-6 left-6">Save</Button>
      </div>
    )
  }
}

export default UserSettings