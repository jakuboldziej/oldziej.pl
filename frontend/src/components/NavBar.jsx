import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import { Link } from "react-router-dom"
import { useContext, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"

function NavBar() {
  const { currentUser } = useContext(AuthContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const toggleOffcanvas = () => setShowOffcanvas((prev) => !prev);
  return (
    <>
      {/* <Navbar collapseOnSelect className="px-2" variant="dark" >
        <Container>
          <Link to="/" className="link link-light navbar-brand"><b>Home</b></Link>
          <Nav className="me-auto">
            <Link to="/darts" className="nav-link"><b>Darts</b></Link>
            <Link to="/ftp" className="nav-link"><b>FTP</b></Link>
          </Nav>
        </Container>
        <Navbar.Collapse className="justify-content-end">
        <Button variant="outline-light" onClick={toggleOffcanvas}>
            {currentUser.displayName}
          </Button>
        </Navbar.Collapse>
      </Navbar> */}
      <nav>
        <div className="p-2">
          <div className="w-full" id="navbar-default">
            <ul className="text-base font-medium flex p-0 flex-row mt-0">
              <li>
                <Link to="/" className="block py-2 px-2 text-white p-0" aria-current="page"><b>Home</b></Link>
              </li>
              <li>
                <Link to="/darts" className="block py-2 px-2 text-gray-400 hover:text-gray-200 p-0">Darts</Link>
              </li>
              <li>
                <Link to="/ftp" className="block py-2 px-2 text-gray-400 hover:text-gray-200 p-0">FTP</Link>
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
                      <Button variant="outline_white">Settings</Button>
                    </div>
                    <div className="absolute right-2 bottom-2 text-white">
                      <Button variant="outline_red" onClick={() => signOut(auth)}>Log Out</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </li>
            </ul>
          </div>
        </div>
      </nav>



      {/* <Offcanvas className="bg-dark text-white" show={showOffcanvas} onHide={toggleOffcanvas} placement="end">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>{currentUser.displayName}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Button variant="outline-light">Settings</Button>
          <div className="position-absolute bottom-0 end-0 m-2">
            <Button variant="outline-danger" onClick={()=>signOut(auth)}>Log Out</Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas> */}
    </>
  )
}

export default NavBar