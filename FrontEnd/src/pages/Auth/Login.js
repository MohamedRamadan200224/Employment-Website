import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../../css/Login.css";
import Alert from "react-bootstrap/Alert";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { setAuthUser } from "../../helper/Storage";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import Container from 'react-bootstrap/Container';

const Login = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState({
    email: "",
    password: "",
    loading: false,
    err: [],
  });

  const LoginFun = (e) => {
    e.preventDefault();
    setLogin({ ...login, loading: true, err: [] });
    axios
      .post("http://localhost:3306/auth/login", {
        email: login.email,
        password: login.password,
      })
      .then((resp) => {
        setLogin({ ...login, loading: false, err: [] });
        setAuthUser(resp.data);
        console.log(resp.data);
        navigate("/");
      })
      .catch((errors) => {
        setLogin({
          ...login,
          loading: false,
          err: errors.response.data.errors,
        });
      });
  };
  
  return (
    <div className="auth-page">
      <div className="auth-header">
        <Container>
          <h1 className="text-center text-white mb-0">Welcome Back</h1>
        </Container>
      </div>
      
      <Container>
        <div className="login-container">
          <div className="auth-form-header">
            <FaSignInAlt className="auth-icon" />
            <h2>Sign In to Your Account</h2>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          {login.err.map((error, index) => (
            <Alert key={index} variant="danger" className="p-2">
              {error.msg}
            </Alert>
          ))}

          <Form onSubmit={LoginFun} className="auth-form">
            <Form.Group className="mb-4">
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <Form.Control
                  type="email"
                  placeholder="Email Address"
                  required
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <Form.Control
                  type="password"
                  placeholder="Password"
                  required
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Button
              className="auth-button"
              variant="primary"
              type="submit"
              disabled={login.loading === true}>
              {login.loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link></p>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};
         
export default Login;