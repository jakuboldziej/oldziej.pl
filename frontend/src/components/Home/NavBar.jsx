import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

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
                <Link to="/ftp" className="block py-2 px-2 text-gray-400 hover:text-gray-200 p-0">Cloud</Link>
              </li>
              <li className="ml-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline_white">{currentUser.displayName}</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{currentUser.displayName}</SheetTitle>
                    </SheetHeader>
                    <div className="py-5 text-white">
                      <Button onClick={() => navigate("/user/settings")} variant="outline_white">Settings</Button>
                      {currentUser.displayName == "kubek" ? (<Button onClick={() => navigate("/admin")} variant="destructive" className="mx-3">Admin</Button>) : null}
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