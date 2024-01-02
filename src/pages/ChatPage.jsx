import Chat from "../components/Chat/Chat"
import SideBar from "../components/Chat/SideBar"
import NavBar from "../components/NavBar"
import "../style.scss"

function ChatPage() {
  document.title = "HomeServer | Chat";

  return (
    <div className="chat-page">
      <NavBar />
      <div className="main">
        <SideBar />
        <Chat />  
      </div>
    </div>
  )
}

export default ChatPage