import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/shadcn/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/shadcn/sheet"
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Contact, Settings } from "lucide-react";

function NavBar() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const signOut = useSignOut();

  const logout = () => {
    signOut();
    navigate('/login');
    setCurrentUser(null);
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
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline_white">{currentUser.displayName}</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-5">
                        {currentUser.displayName} {!currentUser.verified && "(not verified)"}
                        {currentUser.displayName == "kubek" ? (<Button onClick={() => navigate("/admin")} variant="destructive">Admin</Button>) : null}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="py-5 text-white flex flex-col gap-5 w-fit">
                      <Button onClick={() => navigate("/user/settings")} variant="outline_white" className="justify-between">
                        <span className="flex items-center gap-2">
                          <Settings />
                          <span>Settings</span>
                        </span>
                      </Button>
                      <Button disabled={!currentUser.verified} onClick={() => navigate("/user/friends")} variant="outline_lime">
                        <span className="flex items-center gap-2">
                          <Contact />
                          <span>Friends</span>
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