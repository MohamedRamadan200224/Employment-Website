import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../../css/Register.css";
import Alert from "react-bootstrap/Alert";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { setAuthUser } from "../../helper/Storage";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus } from "react-icons/fa";
import Container from 'react-bootstrap/Container';

// API base URL from env (REACT_APP_API_URL); default is the local dev backend.
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3306";

const Register = () => {
  const navigate = useNavigate();
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    loading: false,
    err: [],
  });

  const RegisterFun = (e) => {
    e.preventDefault();
    setRegister({ ...register, loading: true, err: [] });
    axios
      .post(apiUrl + "/auth/register", {
        name: register.name,
        email: register.email,
        password: register.password,
        phone: register.phone
      })
      .then((resp) => {
        setRegister({ ...register, loading: false, err: [] });
        setAuthUser(resp.data);
        navigate("/");
      })
      .catch((errors) => {
        // Normalise the failure into an array of { msg } objects:
        // the backend returns { errors: [...] } for validation
        // failures, { errors: "..." } for e.g. a duplicate email,
        // and { message: "..." } for server errors — and a network
        // failure has no response at all. The old code took
        // errors.response.data.errors verbatim, so any other shape
        // left `err` undefined and the .map() below crashed the
        // whole page ("Cannot read properties of undefined
        // (reading 'map')").
        const data = (errors.response && errors.response.data) || {};
        let errs = data.errors;
        if (typeof errs === "string") errs = [{ msg: errs }];
        if (!Array.isArray(errs)) {
          errs = data.message
            ? [{ msg: data.message }]
            : [{ msg: "Something went wrong, please try again later!" }];
        }
        setRegister({
          ...register,
          loading: false,
          err: errs,
        });
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Container>
          <h1 className="text-center text-white mb-0">Create Account</h1>
        </Container>
      </div>
      
      <Container>
        <div className="register-container">
          <div className="auth-form-header">
            <FaUserPlus className="auth-icon" />
            <h2>Join Our Community</h2>
            <p className="auth-subtitle">Create your account to start applying for jobs</p>
          </div>

          {register.err.map((error, index) => (
            <Alert key={index} variant="danger" className="p-2">
              {error.msg || error}
            </Alert>
          ))}

          <Form onSubmit={RegisterFun} className="auth-form">
            <Form.Group className="mb-3">
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  required
                  value={register.name}
                  onChange={(e) => setRegister({ ...register, name: e.target.value })}
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="input-icon-wrapper">
                <FaEnvelope className="input-icon" />
                <Form.Control
                  type="email"
                  placeholder="Email Address"
                  required
                  value={register.email}
                  onChange={(e) => setRegister({ ...register, email: e.target.value })}
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <Form.Control
                  type="password"
                  placeholder="Password"
                  required
                  value={register.password}
                  onChange={(e) => setRegister({ ...register, password: e.target.value })}
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="input-icon-wrapper">
                <FaPhone className="input-icon" />
                <Form.Control
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={register.phone}
                  onChange={(e) => setRegister({ ...register, phone: e.target.value })}
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Button
              className="auth-button"
              variant="primary"
              type="submit"
              disabled={register.loading === true}>
              {register.loading ? "Creating Account..." : "Create Account"}
            </Button>
            
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default Register;