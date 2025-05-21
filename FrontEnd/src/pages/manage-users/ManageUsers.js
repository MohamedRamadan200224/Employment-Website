import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import Alert from "react-bootstrap/Alert";
import Container from 'react-bootstrap/Container';
import { FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageUsers.css";

let deletenum = 0;
const ManageUsers = () => {

  const auth = getAuthUser();
  const [users, setUsers] = useState({
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });

  useEffect(() => {
    setUsers({ ...users, loading: true });
    axios
      .get("http://localhost:3306/users", {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        console.log(resp);
        setUsers({ ...users, results: resp.data, loading: false, err: null });
      })
      .catch((err) => {
        setUsers({
          ...users,
          loading: false,
          err: " something went wrong, please try again later ! ",
        });
      });
  }, [users.reload]);

  const deleteUser = (id) => {
    axios
      .delete("http://localhost:3306/users/" + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setUsers({
          ...users,
          loading: false,
          reload: users.reload + 1,
        });
        deletenum = 1;
      })
      .catch((err) => {
        setUsers({ ...users, loading: false });
        deletenum = 2;
      });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <Container>
          <h1 className="text-center text-white mb-0 ">
            <FaUsers className="header-icon" /> User Management
          </h1>
        </Container>
      </div>

      <Container className="py-5">
        <div className="admin-card">
          {users.loading && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {!users.loading && users.err && (
            <Alert variant="danger" className="my-3">
              {users.err}
            </Alert>
          )}
 {users.loading === false && users.results.length === 0 && (
          <div className="text-center h-screen">
              <div className="no-requests-container">
                <div className="no-requests-icon">
                  <FaUsers />
                </div>
                <h4 className="no-requests-title">No Users Found</h4>
                <p className="no-requests-message">There are currently no users.</p>
              </div>
          </div>
        )}
          {!users.loading && !users.err && (
            <>
              <div className="admin-card-header">
                <h3 className="admin-title">Manage Users</h3>
                <div className="admin-actions">
                  {deletenum === 1 && (
                    <Alert className="admin-alert admin-alert-success" variant="success">
                      User deleted successfully
                    </Alert>
                  )}
                  {deletenum === 2 && (
                    <Alert className="admin-alert admin-alert-danger" variant="danger">
                      Couldn't delete user
                    </Alert>
                  )}
                  <Link to={"add"} className="btn btn-success admin-btn-add">
                    <FaPlus className="me-2" /> Add New User
                  </Link>
                </div>
              </div>

              <div className="table-responsive admin-table-container">
                <Table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.results.map((user) => {
                      return (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>
                            <span className={`status-badge ${user.status === "active" ? "status-active" : "status-inactive"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <span className={`type-badge ${user.type === 1 ? "type-admin" : "type-user"}`}>
                              {user.type === 0 ? "User" : "Admin"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <Link to={"/manage-users/" + user.id} className="btn btn-primary action-btn">
                              <FaEdit />
                            </Link>
                            <button className="btn btn-danger action-btn" onClick={(e) => { deleteUser(user.id) }}>
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ManageUsers;