import Loading from "@/components/Home/Loading";
import SettingsDialog from "@/components/Home/User/SettingsDialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { AuthContext } from "@/context/Home/AuthContext";
import { getAuthUser } from "@/lib/fetch";
import { useContext, useEffect, useState } from "react";

function UserSettings() {
  document.title = "Oldziej | Settings";

  const { currentUser } = useContext(AuthContext);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({
    usernameOpened: false,
    passwordOpened: false,
    emailOpened: false,
    deleteProfile: false,
    title: ""
  });

  const handleVerifiedUser = () => {
    if (currentUser.verified) return true;
    else return false;
  }

  const handleChangeButton = (type) => {
    if (type === "username") {
      setDialogData((prev) => ({
        ...prev,
        usernameOpened: true,
        title: "Change username"
      }));
    }
    else if (type === "email") {
      setDialogData((prev) => ({
        ...prev,
        emailOpened: true,
        title: "Change email"
      }));
    } else if (type === "password") {
      setDialogData((prev) => ({
        ...prev,
        passwordOpened: true,
        title: "Change password"
      }));
    }
    setDialogOpen(true);
  }

  const handleOpenDeleteDialog = () => {
    setDialogData((prev) => ({
      ...prev,
      passwordOpened: false,
      emailOpened: false,
      deleteProfile: true,
      title: "Delete profile"
    }));
    setDialogOpen(true);
  }

  useEffect(() => {
    if (dialogOpen === false) {
      setDialogData({
        usernameOpened: false,
        passwordOpened: false,
        emailOpened: false,
        deleteProfile: false,
        title: ""
      })
    }
  }, [dialogOpen]);

  useEffect(() => {
    const fetchAuthUser = async () => {
      const fetchedAuthUser = await getAuthUser(currentUser.displayName);

      setAuthUser(fetchedAuthUser);

      setIsLoading(false);
    }

    fetchAuthUser();
  }, []);

  const dialogProps = {
    dialogOpen,
    setDialogOpen,
    dialogData,
    setDialogData,
    authUser,
    setAuthUser,
  }

  if (isLoading) {
    return (
      <Loading />
    )
  } else {
    return (
      <>
        <div className='settings text-white flex flex-col gap-10'>
          <span className="text-5xl p-12">Settings {!handleVerifiedUser() && <span>(Verify your email)</span>}</span>
          <div className="forms px-12 flex flex-col gap-10">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="username" id="username" defaultValue={authUser.displayName} readOnly />
                <Button
                  // disabled={!handleVerifiedUser()}
                  disabled
                  onClick={() => handleChangeButton("username")}
                >
                  Change
                </Button>
              </div>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="email" id="email" defaultValue={authUser.email} readOnly />
                <Button disabled={!handleVerifiedUser()} onClick={() => handleChangeButton("email")}>Change</Button>
              </div>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="password" id="password" defaultValue="**********" readOnly />
                <Button disabled={!handleVerifiedUser()} onClick={() => handleChangeButton("password")}>Change</Button>
              </div>
            </div>
            <div className="absolute bottom-12 left-12">
              <Button variant="destructive" onClick={handleOpenDeleteDialog}>Delete profile</Button>
            </div>
          </div>
        </div>

        <SettingsDialog props={dialogProps} />
      </>
    )
  }
}

export default UserSettings