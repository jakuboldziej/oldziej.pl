import { toast } from "sonner";
import DOMPurify from 'dompurify';

function ShowNewToast(title, description, type = "info", duration = 5000) {
  toast(title, {
    description: <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />,
    action: {
      label: "Close",
      onClick: () => { },
    },
    type: type,
    duration: duration
  })
}

export default ShowNewToast;