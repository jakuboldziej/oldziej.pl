import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { v4 as uuid } from "uuid";

const Input = () => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if(text === "") return;
    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion({
        id: uuid(),
        text,
        senderId: currentUser.uid,
        date: Timestamp.now()
      })
    });
    
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text,
        userUID: currentUser.uid
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text,
        userUID: currentUser.uid
      },
      [data.chatId + ".date"]: serverTimestamp(),
      [data.chatId + ".read"]: false
    });

    setText("");
  }

  useEffect(() => {
    inputRef.current.focus(); 
  });

  return (
    <div className="input">
      <input ref={inputRef} type="text" placeholder="Type something..." onChange={e=>setText(e.target.value)} value={text} onKeyDown={(e)=>{if(e.key === "Enter"){handleSend()}}}/>
      <div className="send">
        {/* <img src={Attach} alt="" />
        <input type="file" style={{ display: "none" }} id="file" onChange={e=>setImage(e.target.files[0])}/>
        <label htmlFor="file">
        </label> */}
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;