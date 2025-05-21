import React from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from "react-router-dom";
import { removeAuthUser, getAuthUser } from "../helper/Storage";
import { FaUserCircle, FaSignOutAlt, FaList, FaUsers, FaClipboardList, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import "../css/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const auth = getAuthUser();
  
  const Logout = () => {
    removeAuthUser();
    navigate("/");
  };
  
  return (
    <div className="header-wrapper">
      <Navbar expand="lg" variant="dark" className="modern-navbar">
        <Container>
          <Navbar.Brand>
            <Link className="nav-link brand-link" to="/">
              <span className="brand-text">Employment Dashboard</span>
            </Link>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link className="nav-link" to="/">
                <FaList className="nav-icon" /> List Jobs
              </Link>
              
              {!auth && (
                <>
                  <Link className="nav-link" to={"/login"}>
                    <FaSignInAlt className="nav-icon" /> Login
                  </Link>
                  <Link className="nav-link" to={"/register"}>
                    <FaUserPlus className="nav-icon" /> Register
                  </Link>
                </>
              )}

              {auth && auth.type === 1 && (
                <>
                  <Link className="nav-link" to="/manage-jobs">
                    <FaList className="nav-icon" /> Manage Jobs
                  </Link>
                  <Link className="nav-link" to="/manage-users">
                    <FaUsers className="nav-icon" /> Manage Users
                  </Link>
                  <Link className="nav-link" to="/manage-requests">
                    <FaClipboardList className="nav-icon" /> Manage Requests
                  </Link>
                </>
              )}
            </Nav>
            
            {auth && (
              <Nav className="ms-auto">
                <div className="user-info">
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{auth.name}</span>
                </div>
                <button className="logout-btn" onClick={Logout}>
                  <FaSignOutAlt className="logout-icon" /> Logout
                </button>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;