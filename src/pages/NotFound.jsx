import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  document.title = "HomeServer | 404 - Not Found";
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <h1>404 - Not Found</h1>
      <Link onClick={()=>navigate(-1)} className="login100-form-btn">Back</Link>
    </div>
  );
};

export default NotFound;
