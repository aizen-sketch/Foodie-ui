import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    // your login API call logic here

    // IF LOGIN SUCCESS
    navigate("/menu");   // redirect to Menu page
  };

  return (
    <div>
      {/* form here */}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
