import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Info = () => {
  const [chats, setChats] = useState(0)
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const getChatsLength = async () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        doc = doc.data();
        setChats(Object.entries(doc).length);
      })

      return () => {
        unsub();
      }
    }
    currentUser.uid && getChatsLength();
  }, [currentUser.uid]);

  return (
    <div className="info">
      <span>Chats: {chats}</span>
    </div>
  );
};

export default Info;