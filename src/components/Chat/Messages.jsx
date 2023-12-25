import { doc, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { db } from "../../firebase";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);
  const messagesEndRef = useRef(null);
  const [newMessagesSinceLastActive, setNewMessagesSinceLastActive] = useState(false);

  const scrollToEnd = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
      setNewMessagesSinceLastActive(true);
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  // Scroll to the end when the messages change or when there are new messages since last active
  useEffect(() => {
    if (messages.length > 0 && (newMessagesSinceLastActive || document.visibilityState === 'visible')) {
      scrollToEnd();
      setNewMessagesSinceLastActive(false); // Reset flag
    }
  }, [messages, newMessagesSinceLastActive]);

  // Listen for visibility change in the document
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setNewMessagesSinceLastActive(false); // Reset flag when window becomes visible
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="messages">
      <div className="conv-start">
        This is the start of the conversation with {data.user.displayName}.
      </div>
      <hr/>
      {messages.map((m) => (
        <Message message={m} key={m.id} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
