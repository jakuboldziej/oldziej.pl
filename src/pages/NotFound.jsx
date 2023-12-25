const NotFound = () => {
  document.title = "HomeServer | 404 - Not Found";

  return (
    <div className="notfound">
      <h1>404 - Not Found</h1>
      <a href="/" className="login100-form-btn">Home</a>
    </div>
  );
};

export default NotFound;
