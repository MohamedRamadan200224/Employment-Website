import {React,useEffect,useState} from "react";
import Alert  from "react-bootstrap/Alert";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../../css/Register.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

let addnum=0;
const AddUser=()=>{
  const auth = getAuthUser();
  const [adduser, setAddUser] = useState({
    name:"",
    email: "",
    password: "",
    phone:"",
    status:"",
    type:"",
    loading: false,
    err: [],
    reload:false,
    success:[],
  });

  const AddFun = (e) => {
    
    setAddUser({ ...adduser, loading: true, err: [] });
    axios
      .post("http://localhost:3306/users",{
        name: adduser.name,
        email: adduser.email,
        password:  adduser.password,
        phone: adduser.phone,
        status: 'inactive',
        type: adduser.type,
      },{
        headers: {
          token:auth.token,
        },
      })
      .then((resp) => {
        setAddUser({ ...adduser,success:"Added User Successfully",loading: false, err: [] });
        addnum=1;
        

      })
      .catch((errors) => {
        setAddUser({
          ...adduser,
          loading: false,
          success:null,
          err: "Couldn't Add User",
        });
        addnum=2;
      });
  };



    return (
        <div className="login-container">
            <h1 className="login-header">Add User Form</h1>
            { auth.type===1 && addnum===1  && (<Alert className="px-2 py-2" variant="success">
           Added User Successfully
          </Alert>
          )
        }
           { auth.type===1 && addnum===2 && (<Alert className="px-2 py-2" variant="danger">
           User Couldn't Be Added
          </Alert>
          )
        }
            <Form onSubmit={(e)=>{AddFun(e)}}>
      <Form.Group className="mb-3">
        <Form.Label>Name: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter User Name"  value={adduser.name}
            onChange={(e) => setAddUser({ ...adduser, name: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Email: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter Email" value={adduser.email}
            onChange={(e) => setAddUser({ ...adduser, email: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password: </Form.Label>
        <Form.Control type="password" placeholder="Please Enter Password" value={adduser.password}
            onChange={(e) => setAddUser({ ...adduser, password: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Phone: </Form.Label>
        <Form.Control type="number" placeholder="Please Enter Phone Number" value={adduser.phone}
            onChange={(e) => setAddUser({ ...adduser, phone: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Type: </Form.Label>
        <Form.Control type="number" min="0" max="1" placeholder="Please Enter User Type" value={adduser.type}
            onChange={(e) => setAddUser({ ...adduser, type: e.target.value })}/>
      </Form.Group>
      <Button className="btn btn-dark w-100" variant="primary" type="submit"  disabled={adduser.loading===true}>
        Add User
      </Button>
    </Form>
        </div>
    
    );
};

export default AddUser;