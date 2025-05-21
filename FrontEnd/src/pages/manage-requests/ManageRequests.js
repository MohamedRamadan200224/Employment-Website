import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Container from 'react-bootstrap/Container';
import { FaClipboardList, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import "./ManageRequests.css";

const ManageRequests = () => {
  let reqnum = 0;
  const auth = getAuthUser();
  const navigate = useNavigate();
  const [requests, setRequests] = useState({
    applicationreview: '',
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });

  useEffect(() => {
    setRequests({ ...requests, loading: true });
    axios
      .get("http://localhost:3306/requests-review", {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        console.log("Requests data:", resp.data);
        setRequests({ ...requests, results: resp.data, loading: false, err: null });
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setRequests({
          ...requests,
          loading: false,
          err: "Something went wrong, please try again later!",
        });
      });
  }, [requests.reload]);
  
  const [jobs, setJobs] = useState({
    loading: true,
    results: [],
    err: null,
    reload:0
  });

  useEffect(() => {
    setJobs({ ...jobs, loading: true });
    axios
      .get("http://localhost:3306/jobs")
      .then((resp) => {
        console.log(resp);
        setJobs({ ...jobs,results:resp.data, loading: false, err: null });
      })
      .catch((err) => {
        setJobs({
          ...jobs,
          loading: false,
          err: " something went wrong, please try again later ! ",
        });
      });
  }, []);

  const [users, setUsers] = useState({
    loading: true,
    results: [],
    err: null,
  });

  useEffect(() => {
    setUsers({ ...users, loading: true });
    axios
      .get("http://localhost:3306/users",{
        headers: {
          token:auth.token,
        },
      })
      .then((resp) => {
        console.log(resp);
        setUsers({ ...users,results:resp.data, loading: false, err: null });
      })
      .catch((err) => {
        setUsers({
          ...users,
          loading: false,
          err: " something went wrong, please try again later ! ",
        });
      });
  }, []);

  const acceptReview =(id)=>{
    axios
    .put("http://localhost:3306/requests-review/"+id,{
      applicationreview: "Accepted",
    },{
      headers: {
        token:auth.token,
      },
    })
    .then((resp) => {
      if(resp.data && resp.data.length > 0){
        setRequests({
          ...requests,
          results:resp.data,
          loading: false,
        });
      }
     
      reqnum = 1;
      navigate("/manage-requests/rev/"+id);
    })
    .catch((err) => {
      setRequests({ ...requests, loading: false });
    });
  };
  let rejectReview =(id)=>{
    axios
    .put("http://localhost:3306/requests-review/"+id,{
      applicationreview:"Rejected"
    },{
      headers: {
        token:auth.token,
      },
    })
    .then((resp) => {
      setRequests({
        ...requests,
        results:resp.data,
        loading: false,
      });
      reqnum=2;
      navigate("/manage-requests/rev/"+id);
    })
    .catch((err) => {
      setRequests({...requests, loading: false});
    });
  };

    return (

        <div className="home-container p-5">
        {/* Loader  */}
        {requests.loading === true && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        {requests.loading === false && requests.results.length === 0 && (
          <div className="text-center h-screen">
              <div className="no-requests-container">
                <div className="no-requests-icon">
                  <FaClipboardList />
                </div>
                <h4 className="no-requests-title">No Applications Found</h4>
                <p className="no-requests-message">There are currently no job applications to review.</p>
              </div>
          </div>
        )}
  
  {requests.loading === false && requests.err == null  && (
        <div className="manage-requests p-5">
         <div className="header d-flex justify-content-between mb-5 mt-1">
          <h3 className="text-center">Manage Requests</h3>
         </div>
         { reqnum===1  && (<Alert className="px-2 py-2" variant="success" data-mdb-delay="3000">
          Accepted Application Successfully
        </Alert>)}
        { reqnum===2 && (<Alert className="px-2 py-2" variant="success" data-mdb-delay="3000">
        Rejected Application Successfully
        </Alert>)}
          <Table striped bordered hover>
      <thead>
        <tr style={{wordWrap:"break-word",textAlign:"center"}}>
          <th>#</th>
          <th>Application Review</th>
          <th>Request Date</th>
          <th>Action</th>
          <th>Job Details</th>
          <th>Applicant Name</th>
          <th>Applicant Email</th>
          <th>Applicant Phone</th>
        </tr>
      </thead>
      <tbody>
        
        {requests.results.map((request)=>(
          
          <tr key={request.id} style={{wordWrap:"break-word",textAlign:"center"}}> 
           <td>{request.id}</td>
           <td><Link to={"/manage-requests/rev/"+request.id} className="btn btn-sm btn-primary mx-2" style={{margin: "4em 4em"}}>Show Request Details</Link></td>
           <td className=" mx-2" style={{wordWrap:"break-word",textAlign:"center"}}>{request.date}</td>
         
           <td style={{textAlign:"center"}}>
           {!["Accepted","Rejected"].includes(request.applicationreview) ? (
            <>
             <button className="btn btn-sm btn-success mx-3 my-3" onClick={(e)=>{acceptReview(request.id)}}>Accept</button>
             <button className="btn btn-sm btn-danger mx-3 my-3" onClick={(e)=>{rejectReview(request.id)}}>Reject</button>
             </>
          ): <span className={`btn btn-sm ${request.applicationreview ==="Accepted"? 'btn-success':'btn-danger'} mx-3 my-3`}>{request.applicationreview}</span> }
           
             </td>
             {jobs.results.map((job)=>(
            job.id===request.job_id && (
             <>
           <td key={job.id}><Link to={"/"+job.id} className="btn btn-sm btn-primary my-4" style={{wordWrap:"break-word",textAlign:"center",margin:"0px 6px 0px"}}>Job Details</Link></td>
              </>
           )   ) )
           
        }
             

           {users.results.map((user)=>(
      
            user.id===request.user_id && (
            <>
           <td style={{wordWrap:"break-word",textAlign:"center",margin:"2px 2px",padding:"5px 5px"}}>{user.name}</td>
           <td style={{wordWrap:"break-word",textAlign:"center",margin:"2px 2px",padding:"5px 5px"}}>{user.email}</td>
           <td style={{wordWrap:"break-word",textAlign:"center",margin:"2px 2px",padding:"5px 5px"}}>{user.phone}</td>
            </>
           ) ) )}
         
        </tr>
       
     )  
            
      )} </tbody>
            </Table></div>)}</div>);}
            export  default ManageRequests;