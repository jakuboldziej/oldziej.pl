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
      <Navbar collapseOnSelect expand="lg" className="px-2" style={{ background: "#9152f8" }} >
        <Container>
          <Navbar.Brand><Link to="/" className="link"><b>Home</b></Link></Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/chat"><b>Chat</b></Nav.Link>
            <Nav.Link href="/ftp"><b>FTP</b></Nav.Link>
          </Nav>
        </Container>
        <Navbar.Collapse className="justify-content-end">
        <Button variant="outline-dark" onClick={toggleOffcanvas}>
            {currentUser.displayName}
          </Button>
        </Navbar.Collapse>
      </Navbar>

      <Offcanvas className="bg-dark text-white" show={showOffcanvas} onHide={toggleOffcanvas} placement="end">
        <Offcanvas.Header closeButton>
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