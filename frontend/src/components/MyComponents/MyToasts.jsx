import { useContext } from "react";
import { ToastsContext } from "../../context/ToastsContext";
import { toast } from "sonner";
import { Button } from "../ui/button";

function MyToasts() {
  const { toasts, setToasts } = useContext(ToastsContext);

  const handleClosingToast = (index) => {
    const updatedToasts = [...toasts];
    updatedToasts[index].show = false;
    setToasts(updatedToasts);
  };

  const toMMSS = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderHTML = (html) => ({ __html: html });

  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
    // <ToastContainer className="position-fixed bottom-0 end-0 p-3">
    //   {/* {toasts.map((toast, index) => (
    //     <Toast key={index} onClose={() => handleClosingToast(index)} show={toast.show} delay={5000} autohide>
    //       <Toast.Header>
    //         <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
    //         <strong className="me-auto">{toast.title}</strong>
    //         <small>{toMMSS(toast.timestamp)}</small>
    //       </Toast.Header>
    //       <Toast.Body>
    //         <div dangerouslySetInnerHTML={renderHTML(toast.description)} />
    //       </Toast.Body> 
    //     </Toast>
    //   ))} */}
    // {/* </ToastContainer> */}
  );
}

export default MyToasts;
