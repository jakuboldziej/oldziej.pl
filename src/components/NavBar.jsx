import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap"
import { Link } from "react-router-dom"
import { useContext, useState } from "react"
import { AuthContext } from "../context/AuthContext"

function NavBar() {
  const { currentUser } = useContext(AuthContext);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const toggleOffcanvas = () => setShowOffcanvas((prev) => !prev);
  return (
    <>
      <Navbar collapseOnSelect className="px-2" style={{ background: "#9152f8" }} >
        <Container>
          <Link to="/" className="link navbar-brand"><b>Home</b></Link>
          <Nav className="me-auto">
            <Link to="/darts" className="nav-link"><b>Darts</b></Link>
            <Link to="/chat" className="nav-link"><b>Chat</b></Link>
            <Link to="/ftp" className="nav-link"><b>FTP</b></Link>
          </Nav>
        </Container>
        <Navbar.Collapse className="justify-content-end">
        <Button variant="outline-dark" onClick={toggleOffcanvas}>
            {currentUser.displayName}
          </Button>
        </Navbar.Collapse>
      </Navbar>

      <Offcanvas className="bg-dark text-white" show={showOffcanvas} onHide={toggleOffcanvas} placement="end">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>{currentUser.displayName}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Button variant="outline-light">Settings</Button>
          <div className="position-absolute bottom-0 end-0 m-2">
            <Button variant="outline-danger" onClick={()=>signOut(auth)}>Log Out</Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default NavBar