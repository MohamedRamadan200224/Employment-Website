import {React,useState} from "react";
import Alert  from "react-bootstrap/Alert";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../../css/Register.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

let addnum=0;

const AddJob=()=>{
  const auth = getAuthUser();
  const [addjob, setAddJob] = useState({
    position:"",
    field: "",
    description: "",
    offer:"",
    qualifications:"",
    maxcandidate:"",
    loading: false,
    err: '',
    success:'',
  });

  const AddFun =  (e) => {
    e.preventDefault();
    setAddJob({ ...addjob, loading: true, err: [] });
    axios
      .post("http://localhost:3306/jobs",{
        position: addjob.position,
        field: addjob.field,
        description: addjob.description,
        offer: addjob.offer,
        qualifications: addjob.qualifications,
        maxcandidate: addjob.maxcandidate,
        
      },{
        headers: {
          token:auth.token,
        },
      })
      .then((resp) => {
        setAddJob({ ...addjob, success: "ADDED JOB SUCCESSFULLY",loading: false, err: [] });
        addnum=1;
        

      })
      .catch((errors) => {
        setAddJob({
          ...addjob,
          loading: false,
          success:[],
          err: "Couldn't Add Job",
        });
        addnum=2;
      });
  };

  


    return (
        <div className="login-container">
            <h1 className="login-header">Add Job Form</h1>
           { auth.type===1 && addnum===1  && (<Alert className="px-2 py-2" variant="success">
           Added Job Successfully
          </Alert>
          )
        }
           { auth.type===1 && addnum===2 && (<Alert className="px-2 py-2" variant="danger">
           Job Couldn't Be Added
          </Alert>
          )
        }
            <Form onSubmit={(e)=>{AddFun(e)}}>
      <Form.Group className="mb-3">
        <Form.Label>Position: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter Job Position"  value={addjob.position}
            onChange={(e) => setAddJob({ ...addjob, position: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Field: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter Field" value={addjob.field}
            onChange={(e) => setAddJob({ ...addjob, field: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Description: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter Description" value={addjob.description}
            onChange={(e) => setAddJob({ ...addjob, description: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Offer: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter Offer" value={addjob.offer}
            onChange={(e) => setAddJob({ ...addjob, offer: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Qualifications: </Form.Label>
        <Form.Control type="text" placeholder="Please Enter Job Qualifications" value={addjob.qualifications}
            onChange={(e) => setAddJob({ ...addjob, qualifications: e.target.value })}/>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Maximum Candidates: </Form.Label>
        <Form.Control type="text"  placeholder="Please Enter Max. Candidates number" value={addjob.maxcandidate}
            onChange={(e) => setAddJob({ ...addjob, maxcandidate: e.target.value })}/>
      </Form.Group>
      <Button className="btn btn-dark w-100" variant="primary" type="submit"  disabled={addjob.loading===true}>
        Add Job
      </Button>
    </Form>
        </div>);
    
};

export default AddJob;