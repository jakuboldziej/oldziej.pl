import { toast } from "sonner";

function ShowNewToast(title, description) {
  const toMMSS = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderHTML = (html) => ({ __html: html });

  toast(title, {
    description: <div dangerouslySetInnerHTML={renderHTML(description)} />,
    action: {
      label: "Close",
      onClick: () => {},
    },
    type: "info"
  })
}

export default ShowNewToast;
