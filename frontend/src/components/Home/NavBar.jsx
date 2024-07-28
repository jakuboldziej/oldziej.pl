import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/shadcn/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/shadcn/sheet";
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Contact, Settings } from "lucide-react";
import { Badge } from "../ui/shadcn/badge";
import { SocketIoContext } from "@/context/SocketIoContext";

function NavBar() {
  const { counters } = useContext(SocketIoContext);
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const signOut = useSignOut();

  const logout = () => {
    signOut();
    navigate('/login');
    setCurrentUser(null);
  }

  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSheetClose = () => {
    setSheetOpen(false);
  };

  const handleShowBadge = () => {
    if (counters.friendsRequestsReceived > 0) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <>
      <nav>
        <div className="navbar p-2">
          <div className="w-full" id="navbar-default">
            <ul className="text-base font-medium flex p-0 flex-row mt-0">
              <li>
                <Link to="/" className="block py-2 px-2 text-white p-0" aria-current="page"><b>Home</b></Link>
              </li>
              <li>
                <Link to="/darts" className="block py-2 px-2 text-gray-400 hover:text-gray-200 p-0">Darts</Link>
              </li>
              <li>
                <Link to="/cloud" className="block py-2 px-2 text-gray-400 hover:text-gray-200 p-0">Cloud</Link>
              </li>
              <li className="ml-auto">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline_white">
                      {currentUser.displayName}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-5">
                        <span className="cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/user/${currentUser.displayName}`)}>
                          {currentUser.displayName}
                        </span>
                        {!currentUser.verified && "(not verified)"}
                        {currentUser.displayName === "kubek" && (
                          <Button variant="destructive" onClick={() => {
                            navigate('/admin');
                            handleSheetClose();
                          }}>Admin</Button>
                        )}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="py-5 text-white flex flex-col gap-5 w-fit">
                      <Button className="relative" disabled={!currentUser.verified} onClick={() => {
                        navigate('/user/friends');
                        handleSheetClose();
                      }} variant="outline_lime">
                        <span className="flex items-center gap-2">
                          <Contact />
                          <span>Friends</span>
                        </span>
                        {handleShowBadge() && (
                          <Badge className="absolute -top-2 -right-2" variant="destructive">{counters.friendsRequestsReceived}</Badge>
                        )}
                      </Button>
                      <Button onClick={() => {
                        navigate('/user/settings');
                        handleSheetClose();
                      }}
                        variant="outline_white"
                        className="justify-between">
                        <span className="flex items-center gap-2">
                          <Settings />
                          <span>Settings</span>
                        </span>
                      </Button>
                    </div>
                    <div className="absolute right-2 bottom-2 text-white">
                      <Button variant="outline_red" onClick={logout}>Log Out</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavBar