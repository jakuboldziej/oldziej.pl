/* eslint-disable react/prop-types */
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Person from "../../images/person.png";
import Tooltip from 'react-bootstrap/Tooltip';
import { OverlayTrigger } from "react-bootstrap";

const getFormattedMessageTime = (messageTime) => {
  const now = new Date();
  const messageDate = messageTime.toDateString();
  const currentDate = now.toDateString();

  if (messageDate !== currentDate) {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };
    return new Intl.DateTimeFormat('pl-PL', options).format(messageTime);
  } else {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).format(messageTime);
  }
};



const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const msgTime = getFormattedMessageTime(message.date.toDate());

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {msgTime}
    </Tooltip>
  );

  return (
    <div className={`message ${message.senderId === currentUser.uid && "owner"}`}>
      <div className="messageInfo">
        <img src={Person}/>
      </div>
        <div className="messageContent">
          <OverlayTrigger placement="left" delay={{ show: 200, hide: 200 }} overlay={renderTooltip}>
            <p>{message.text}</p>
          </OverlayTrigger>
          {message.img && <img src={message.img} alt="" />}
        </div>
    </div>
  );
};

export default Message;