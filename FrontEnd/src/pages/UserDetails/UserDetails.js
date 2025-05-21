import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Container from 'react-bootstrap/Container';
import { getAuthUser } from "../../helper/Storage";
import { FaUser, FaEnvelope, FaPhone, FaUserShield, FaCircle } from "react-icons/fa";
import "./UserDetails.css";

const UserDetails = () => {
  let { id } = useParams();
  const auth = getAuthUser();
  const [user, setUser] = useState({
    loading: true,
    result: [],
    err: null,
    reload: 0,
  });

  useEffect(() => {
    setUser({ ...user, loading: true });
    axios
      .get("http://localhost:3306/users/" + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setUser({ ...user, result: resp.data, loading: false, err: null });
      })
      .catch((err) => {
        setUser({
          ...user,
          loading: false,
          err: "Something went wrong, please try again later!",
        });
      });
  }, []);

  const getUserType = () => {
    if (user.result.type === 1) {
      return "Admin";
    } else {
      return "User";
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <Container>
          <h1 className="text-center text-white mb-0">
            <FaUser className="header-icon" /> User Profile
          </h1>
        </Container>
      </div>

      <Container className="py-5">
        {/* Loader */}
        {user.loading === true && (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {user.loading === false && user.err != null && (
          <Alert variant="danger" className="my-3">
            {user.err}
          </Alert>
        )}

        {user.loading === false && user.err == null && user.result && (
          <div className="admin-card">
            <div className="user-profile-header">
              <div className="user-avatar">
                {user.result.name && user.result.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="user-name">{user.result.name}</h2>
              <div className="user-status">
                <FaCircle className={`status-indicator ${user.result.status === "active" ? "status-active" : "status-inactive"}`} />
                <span className="status-text">{user.result.status}</span>
              </div>
            </div>

            <div className="user-details-grid">
              <div className="user-detail-item">
                <div className="detail-icon">
                  <FaEnvelope />
                </div>
                <div className="detail-content">
                  <h3 className="detail-label">Email</h3>
                  <p className="detail-value">{user.result.email}</p>
                </div>
              </div>

              <div className="user-detail-item">
                <div className="detail-icon">
                  <FaPhone />
                </div>
                <div className="detail-content">
                  <h3 className="detail-label">Phone</h3>
                  <p className="detail-value">{user.result.phone}</p>
                </div>
              </div>

              <div className="user-detail-item">
                <div className="detail-icon">
                  <FaUserShield />
                </div>
                <div className="detail-content">
                  <h3 className="detail-label">Account Type</h3>
                  <p className="detail-value">
                    <span className={`type-badge ${user.result.type === 1 ? "type-admin" : "type-user"}`}>
                      {getUserType()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {auth && (
              <div className="user-actions">
                <Link to="" className="request-user-btn">
                  Request User
                </Link>
              </div>
            )}
          </div>
        )}

        {user.loading === false && user.err == null && !user.result && (
          <Alert variant="danger" className="my-3">
            No users found, please try again later!
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default UserDetails;