import {React, useState, useEffect} from "react";
import Alert from "react-bootstrap/Alert";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import "../../css/Register.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import { useParams } from "react-router-dom";

let updatenum = 0;

const UpdateUser = () => {
  const auth = getAuthUser();
  const {id} = useParams();
  const [updateuser, setUpdateUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "",
    type: "",
    loading: false,
    fetchLoading: true,
    err: '',
    success: '',
  });

  // Fetch user data when component mounts
  useEffect(() => {
    axios
      .get(`http://localhost:3306/users/${id}`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        const userData = resp.data;
        setUpdateUser({
          ...updateuser,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          type: userData.type || "",
          status: userData.status || "",
          fetchLoading: false,
        });
      })
      .catch((error) => {
        setUpdateUser({
          ...updateuser,
          fetchLoading: false,
          err: "Failed to load user data",
        });
      });
  }, [id]);

  const UpdateFun = (id) => {
    setUpdateUser({ ...updateuser, loading: true, err: [] });
    axios
      .put("http://localhost:3306/users/"+id, {
        name: updateuser.name,
        email: updateuser.email,
        password: updateuser.password,
        phone: updateuser.phone,
        type: updateuser.type,
      }, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setUpdateUser({ ...updateuser, success: "Updated User successfully", loading: false, err: [] });
        updatenum = updatenum + 1;
      })
      .catch((errors) => {
        setUpdateUser({
          ...updateuser,
          loading: false,
          success: null,
          err: "Couldn't Update User",
        });
      });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="text-center text-white mb-0">Update User</h1>
        </div>
      </div>

      <div className="container py-5">
        <div className="admin-card">
          {updateuser.fetchLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {updatenum === 1 && (
                <Alert className="px-2 py-2" variant="success">
                  {updateuser.success}
                </Alert>
              )}
              {updateuser.err && (
                <Alert className="px-2 py-2" variant="danger">
                  {updateuser.err}
                </Alert>
              )}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name: </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Please Enter User Name" 
                    value={updateuser.name}
                    onChange={(e) => setUpdateUser({ ...updateuser, name: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email: </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Please Enter Email" 
                    value={updateuser.email}
                    onChange={(e) => setUpdateUser({ ...updateuser, email: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password: </Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Leave blank to keep current password" 
                    value={updateuser.password}
                    onChange={(e) => setUpdateUser({ ...updateuser, password: e.target.value })}
                  />
                  <Form.Text className="text-muted">
                    Leave blank if you don't want to change the password
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone: </Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Please Enter Phone Number" 
                    value={updateuser.phone}
                    onChange={(e) => setUpdateUser({ ...updateuser, phone: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Type: </Form.Label>
                  <Form.Select 
                    value={updateuser.type}
                    onChange={(e) => setUpdateUser({ ...updateuser, type: e.target.value })}
                  >
                    <option value="">Select User Type</option>
                    <option value="0">Regular User</option>
                    <option value="1">Admin</option>
                  </Form.Select>
                </Form.Group>
                <Button 
                  className="btn btn-primary w-100" 
                  type="button" 
                  onClick={(e) => {UpdateFun(id)}} 
                  disabled={updateuser.loading === true}
                >
                  {updateuser.loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Updating...</span>
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;