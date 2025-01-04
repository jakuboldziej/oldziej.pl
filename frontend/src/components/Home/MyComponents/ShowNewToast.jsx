import { toast } from "sonner";
import DOMPurify from 'dompurify';

function ShowNewToast(title, description, type = "info") {
  console.log(description)
  toast(title, {
    description: <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />,
    action: {
      label: "Close",
      onClick: () => { },
    },
    type: type,
    duration: 5000
  })
}

export default ShowNewToast;
