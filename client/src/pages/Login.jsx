import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logof.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { loginRoute } from "./../utils/APIRoutes";
import axios from "axios";
import {
  AuthPage,
  AuthCard,
  AuthForm,
  AuthInput,
  AuthButton,
  AuthLink,
  Brand,
} from "../components/AuthLayout";

const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("chat-app-user")) navigate("/");
  }, [navigate]);
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = values;
    if (!username || !password) {
      toast.error("Username and password are required", toastOptions);
      return;
    }
    const { data } = await axios.post(loginRoute, { username, password });
    if (data.status === false) {
      toast.error(data.msg, toastOptions);
    } else {
      localStorage.setItem("chat-app-user", JSON.stringify(data.user));
      navigate("/");
    }
  };

  return (
    <>
      <AuthPage>
        <AuthCard>
          <Brand>
            <img src={Logo} alt="" />
          </Brand>
          <AuthForm onSubmit={handleSubmit}>
            <AuthInput
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            <AuthInput
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            <AuthButton type="submit">Log in</AuthButton>
          </AuthForm>
          <AuthLink>
            Don't have an account? <Link to="/register">Register</Link>
          </AuthLink>
        </AuthCard>
      </AuthPage>
      <ToastContainer />
    </>
  );
}

export default Login;
