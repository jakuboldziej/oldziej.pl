import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/shadcn/button";

function NotFound() {
  document.title = "Oldziej | 404 - Not Found";
  const navigate = useNavigate();

  return (
    <div className="notfound-page text-white">
      <span className="text-2xl">404 - Not Found</span>
      <Button onClick={() => navigate(-1)} variant="outline_green" className="glow-button-green">Back</Button>
    </div>
  );
};

export default NotFound;
