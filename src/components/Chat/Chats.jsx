import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import Person from "../../images/person.png";


const Chats = () => {
  const [chats, setChats] = useState([]);
  const [clickedChat, setClickedChat] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const displayLatestChat = async () => {
    const userChats = (await getDoc(doc(db, "userChats", currentUser.uid))).data();
    try{
      const latestChat = Object.entries(userChats).sort((a,b)=>b[1].date - a[1].date)[0]
      const userInfo = latestChat[1].userInfo;
      setClickedChat(latestChat[0]);
      dispatch({type: "CHANGE_USER", payload: userInfo})
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [latestChat[0] + ".read"]: true
      })
    } catch (err) {
      return;
    }
  }

  useEffect(() => {
    displayLatestChat();
  }, []);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        doc.exists() && setChats(doc.data());
      });
  
      return () => {
        unsub();
      }
    }
    currentUser.uid && getChats();
  }, [currentUser.uid]);

  // Mark chat as read when the window regains focus
  useEffect(() => {
    const markChatAsRead = async (chatId) => {
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [chatId + ".read"]: true
      });
    };

    const onFocus = () => {
      if (clickedChat && chats[clickedChat] && !chats[clickedChat].read) {
        markChatAsRead(clickedChat);
      }
    };

    const onFocusChange = () => {
      if (!document.hidden) {
        onFocus(); 
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocusChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocusChange);
    };
  }, [clickedChat, chats, currentUser.uid]);

  const handleSelect = async (chat) => {
    setClickedChat(chat[0]);
    dispatch({type: "CHANGE_USER", payload: chat[1].userInfo});
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [chat[0] + ".read"]: true
    })
  }

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a,b)=>b[1].date - a[1].date).map((chat) => (
        <div className={`userChat ${clickedChat === chat[0] ? 'clicked' : ''}`} key={chat[0]} onClick={() => handleSelect(chat)}>
          <img src={Person}  />
          <div className="userChatInfo">
            <span>{chat[1].userInfo.displayName}</span>
            <span className={`${chat[1].read === false ? 'fw-bold' : ''}`}>{chat[1].lastMessage?.userUID === currentUser.uid ? "You: " : ''}{chat[1].lastMessage?.text}</span>
          </div>
          <input type="button" className={`read ${chat[1].read === true ? 'd-none' : ''}`} />
        </div>
      ))}
    </div>
  );
};

export default Chats;