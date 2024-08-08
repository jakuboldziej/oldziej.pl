import Loading from "@/components/Home/Loading";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({
    emailOpened: false,
    passwordOpened: false,
    title: ""
  });

  const handleVerifiedUser = () => {
    if (currentUser.verified) return true;
    else return false;
  }

  const handleChangeButton = (type) => {
    if (type === "email") {
      setDialogData((prev) => ({
        ...prev,
        emailOpened: true,
        passwordOpened: false,
        title: "Change email"
      }));
    } else if (type === "password") {
      setDialogData((prev) => ({
        ...prev,
        passwordOpened: true,
        emailOpened: false,
        title: "Change password"
      }));
    }
    setDialogOpen(true);
  }

  const handleSaveDialogChange = () => {
    if (dialogData.emailOpened) {
      console.log("saved email");
    } else if (dialogData.passwordOpened) {
      console.log("saved pass");
    }
    handleCloseDialog();
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
      <>
        <div className='settings text-white flex flex-col gap-10'>
          <span className="text-5xl p-12">Settings {!handleVerifiedUser() && <span>(Verify your email)</span>}</span>
          <div className="forms px-12 flex flex-col gap-10">
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
          </div>
          <Button type="submit" className="w-fit absolute bottom-6 left-6">Save</Button>
        </div>

        <Dialog open={dialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='text-center text-2xl'>{dialogData.title}</DialogTitle>
            </DialogHeader>
            <div className='text-white flex flex-col gap-5'>
              {dialogData.emailOpened && (
                <>
                  <div>
                    <Label htmlFor="current-email">Current Email</Label>
                    <Input id="current-email" type="email" value={authUser.email} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="new-email">New Email</Label>
                    <Input id="new-email" type="email" placeholder="New email" autoFocus />
                  </div>
                </>
              )}
              {dialogData.passwordOpened && (
                <>
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" autoFocus />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="repeat-new-password">Repeat New Password</Label>
                    <Input id="repeat-new-password" type="password" />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                Close
              </Button>
              <Button type="submit" onClick={handleSaveDialogChange}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}

export default UserSettings