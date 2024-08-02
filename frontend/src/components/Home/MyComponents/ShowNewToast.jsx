import { toast } from "sonner";

function ShowNewToast(title, description, type = "info") {
  const renderHTML = (html) => ({ __html: html });

  toast(title, {
    description: <div dangerouslySetInnerHTML={renderHTML(description)} />,
    action: {
      label: "Close",
      onClick: () => { },
    },
    type: type,
    duration: 5000
  })
}

export default ShowNewToast;
