import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import ShowNewToast from "../MyComponents/ShowNewToast";
import { useContext, useEffect, useState } from "react";
import { changeDisplaynameUser, changePassword, handleDeleteAuthUser, sendChangeEmail, userDeletedAccountEmail } from "@/lib/fetch";
import Loading from "../Loading";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router";
import { AuthContext } from "@/context/Home/AuthContext";
import Cookies from "js-cookie";
import { DialogDescription } from "@radix-ui/react-dialog";

function SettingsDialog({ props }) {
  const { dialogOpen, setDialogOpen, dialogData, authUser, setAuthUser } = props;

  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [err, setErr] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [repeatNewUsernameInput, setRepeatNewUsernameInput] = useState('');

  const [newEmailInput, setNewEmailInput] = useState('');
  const [repeatNewEmailInput, setRepeatNewEmailInput] = useState('');

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [repeatNewPasswordInput, setRepeatNewPasswordInput] = useState('');

  const navigate = useNavigate();
  const signOut = useSignOut();

  const handleDialogSubmit = (e) => {
    e.preventDefault();
    if (dialogData.deleteProfile) {
      handleDeleteUser();
    } else {
      handleSubmitDialogDataChange();
    }
  }

  const handleSubmitDialogDataChange = async () => {
    setSubmitLoading(true);

    if (dialogData.usernameOpened) {
      if (newUsernameInput !== repeatNewUsernameInput) {
        setSubmitLoading(false);
        return setErr("Your usernames doesn't match!");
      }

      const randomNumber = Math.floor(Math.random() * 900) + 100;
      const friendsCode = newUsernameInput + randomNumber;

      const response = await changeDisplaynameUser({
        oldDisplayName: authUser.displayName,
        newDisplayName: newUsernameInput,
        friendsCode: friendsCode
      });

      if (response?.error) {
        setSubmitLoading(false);
        return setErr(response.error);
      }

      setAuthUser((prev) => ({ ...prev, displayName: newUsernameInput }))
      setCurrentUser((prev) => ({ ...prev, displayName: newUsernameInput }))

      let userCookie = JSON.parse(Cookies.get('_auth_state'));
      userCookie.displayName = newUsernameInput;
      const domain = import.meta.env.MODE === "development" ? ".home.localhost" : ".home.oldziej.pl";
      Cookies.set("_auth_state", JSON.stringify(userCookie), { domain });

      setSubmitLoading(false);
      ShowNewToast("Settings Changed", "Your username was changed successfully.", "success");
    } else if (dialogData.emailOpened) {
      if (newEmailInput !== repeatNewEmailInput) {
        setSubmitLoading(false);
        return setErr("Your emails doesn't match!");
      }

      const response = await sendChangeEmail({
        userEmail: authUser.email,
        newUserEmail: newEmailInput
      });
      if (response?.error) {
        setSubmitLoading(false);
        return setErr(response.error);
      }

      setSubmitLoading(false);
      ShowNewToast("Settings Changed", "We've sent verification email on your current email address.");
    } else if (dialogData.passwordOpened) {
      if (currentPasswordInput === newPasswordInput || currentPasswordInput === repeatNewPasswordInput) {
        setSubmitLoading(false);
        return setErr("Your new password must be different then your current password!");
      } else if (newPasswordInput !== repeatNewPasswordInput) {
        setSubmitLoading(false);
        return setErr("Your passwords doesn't match!");
      } else if (newPasswordInput.length < 6) {
        setSubmitLoading(false);
        return setErr("Password must be at least 6 characters long!");
      }

      const response = await changePassword({
        displayName: authUser.displayName,
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput
      });
      if (response?.error) {
        setSubmitLoading(false);
        return setErr(response.error);
      }

      setSubmitLoading(false);
      ShowNewToast("Settings Changed", "Your password was changed successfully.", "success");
    }
    handleCloseDialog();
  }

  const handleDeleteUser = async () => {
    await userDeletedAccountEmail({
      deletedUserDisplayName: currentUser.displayName
    });

    await handleDeleteAuthUser(authUser);
    setCurrentUser(null);
    signOut();
    navigate("/auth");
    localStorage.clear();
  }

  const handleCloseDialog = () => {
    setErr("");

    setNewUsernameInput("");
    setRepeatNewUsernameInput("");

    setNewEmailInput("");
    setRepeatNewEmailInput("");

    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setRepeatNewPasswordInput("");

    setDialogOpen(false);
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
    <Dialog open={dialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl'>{dialogData.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="hidden">User settings</DialogDescription>
        <form onSubmit={handleDialogSubmit}>
          <div className='text-white flex flex-col gap-5'>
            {dialogData.usernameOpened && (
              <>
                <div>
                  <Label htmlFor="current-username">Current Username</Label>
                  <Input id="current-username" type="username" value={authUser.displayName} readOnly required />
                </div>
                <div>
                  <Label htmlFor="new-username">New Username</Label>
                  <Input id="new-username" type="username" autoComplete="false" autoFocus required value={newUsernameInput} onChange={(e) => setNewUsernameInput(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="repeat-new-username">Repeat New Username</Label>
                  <Input id="repeat-new-username" type="username" autoComplete="false" required value={repeatNewUsernameInput} onChange={(e) => setRepeatNewUsernameInput(e.target.value)} />
                </div>
              </>
            )}
            {dialogData.emailOpened && (
              <>
                <div>
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input id="current-email" type="email" value={authUser.email} readOnly required />
                </div>
                <div>
                  <Label htmlFor="new-email">New Email</Label>
                  <Input id="new-email" type="email" autoComplete="false" autoFocus required value={newEmailInput} onChange={(e) => setNewEmailInput(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="repeat-new-email">Repeat New Email</Label>
                  <Input id="repeat-new-email" type="email" autoComplete="false" required value={repeatNewEmailInput} onChange={(e) => setRepeatNewEmailInput(e.target.value)} />
                </div>
              </>
            )}
            {dialogData.passwordOpened && (
              <>
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" autoFocus required value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" autoComplete="false" autoCorrect="false" required value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="repeat-new-password">Repeat New Password</Label>
                  <Input id="repeat-new-password" type="password" autoComplete="false" autoCorrect="false" required value={repeatNewPasswordInput} onChange={(e) => setRepeatNewPasswordInput(e.target.value)} />
                </div>
              </>
            )}
            {dialogData.deleteProfile && (
              <div className="text-center text-xl">
                <span>Are you sure you want to delete your profile?</span>
                <span>Your darts and cloud data will be deleted</span>
              </div>
            )}
          </div>
          {submitLoading ? (
            <Loading />
          ) : (
            <DialogFooter className="pt-6">
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>Close</Button>
              {dialogData.deleteProfile ? (
                <Button variant="destructive" type="submit">Delete profile</Button>
              ) : (
                <Button type="submit">Save changes</Button>
              )}
            </DialogFooter>
          )}
          {err && <span id="error_message" className="text-center">{err}</span>}
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog