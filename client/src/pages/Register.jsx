import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logof.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { registerRoute } from "./../utils/APIRoutes";
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

function Register() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("chat-app-user")) navigate("/");
  }, [navigate]);
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleValidation = () => {
    const { username, email, password, confirmPassword } = values;
    if (!username || !email || !password || !confirmPassword) {
      toast.error("All fields are required", toastOptions);
      return false;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters", toastOptions);
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters", toastOptions);
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
    const { username, email, password } = values;
    const { data } = await axios.post(registerRoute, {
      username,
      password,
      email,
    });
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
            <h1>Talk-A-Tive</h1>
          </Brand>
          <AuthForm onSubmit={handleSubmit}>
            <AuthInput
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            <AuthInput
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <AuthInput
              type="password"
              placeholder="Password (min 8 characters)"
              name="password"
              onChange={handleChange}
            />
            <AuthInput
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              onChange={handleChange}
            />
            <AuthButton type="submit">Create account</AuthButton>
          </AuthForm>
          <AuthLink>
            Already have an account? <Link to="/login">Log in</Link>
          </AuthLink>
        </AuthCard>
      </AuthPage>
      <ToastContainer />
    </>
  );
}

export default Register;