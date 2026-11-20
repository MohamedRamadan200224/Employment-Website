import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { FaClipboardList } from "react-icons/fa";
import "./ManageRequests.css";

// API base URL from env (REACT_APP_API_URL); default is the local dev backend.
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3306";

const ManageRequests = () => {
  let reqnum = 0;
  const auth = getAuthUser();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [requests, setRequests] = useState({
    applicationreview: '',
    loading: true,
    results: [],
    total: 0,
    err: null,
    reload: 0,
  });

  // Perf P0: one fetch only. The old code fetched /requests-review,
  // /jobs AND /users (all unbounded) and joined them in the browser —
  // for each request row it mapped over ALL jobs and ALL users
  // (O(requests x (jobs + users)) on every render). The list endpoint
  // now returns one server-side JOIN per page, with the applicant name
  // / email / phone and the job title already on each row, plus a
  // total for pagination: { data, total, page, limit }.
  useEffect(() => {
    setRequests((prev) => ({ ...prev, loading: true }));
    axios
      .get(`${apiUrl}/requests-review?page=${page}&limit=${PAGE_SIZE}`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        console.log("Requests data:", resp.data);
        setRequests((prev) => ({ ...prev, results: resp.data.data || [], total: resp.data.total || 0, loading: false, err: null }));
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setRequests((prev) => ({
          ...prev,
          loading: false,
          err: "Something went wrong, please try again later!",
        }));
      });
  }, [requests.reload, page, auth.token]);

  const acceptReview =(id)=>{
    axios
    .put(apiUrl + "/requests-review/"+id,{
      applicationreview: "Accepted",
    },{
      headers: {
        token: auth.token,
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
    .put(apiUrl + "/requests-review/"+id,{
      applicationreview:"Rejected"
    },{
      headers: {
        token: auth.token,
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

  // Download an application's CV (PDF). A plain link cannot send the
  // token header the backend requires, so the file is fetched as a
  // blob with axios and saved from an object URL instead.
  const downloadCv = (request) => {
    axios
      .get(apiUrl + "/requests-review/" + request.id + "/cv", {
        headers: {
          token: auth.token,
        },
        responseType: "blob",
      })
      .then((resp) => {
        const url = window.URL.createObjectURL(resp.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = request.cv_filename || "cv.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Error downloading CV:", err);
      });
  };

    const totalPages = Math.max(1, Math.ceil(requests.total / PAGE_SIZE));

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
          <th>CV</th>
        </tr>
      </thead>
      <tbody>
        
        {requests.results.map((request)=>(
          
          <tr key={request.id} style={{wordWrap:"break-word",textAlign:"center"}}> 
           <td>{request.id}</td>
           <td><Link to={"/manage-requests/rev/"+request.id} className="btn btn-sm btn-primary mx-2" style={{margin: "4em 4em"}}>Show Request Details</Link></td>
           <td className=" mx-2" style={{wordWrap:"break-word",textAlign:"center"}}>{request.date}</td>
         
           <td style={{textAlign:"center"}}>
           { !["Accepted","Rejected"].includes(request.applicationreview) ? (
            <>
             <button className="btn btn-sm btn-success mx-3 my-3" onClick={(e)=>{acceptReview(request.id)}}>Accept</button>
             <button className="btn btn-sm btn-danger mx-3 my-3" onClick={(e)=>{rejectReview(request.id)}}>Reject</button>
             </>
          ): <span className={`btn btn-sm ${request.applicationreview ==="Accepted"? 'btn-success':'btn-danger'} mx-3 my-3`}>{request.applicationreview}</span> }
           
             </td>
           <td><Link to={"/"+request.job_id} className="btn btn-sm btn-primary my-4" style={{wordWrap:"break-word",textAlign:"center",margin:"0px 6px 0px"}}>{request.jobPosition || "Job Details"}</Link></td>
           <td style={{wordWrap:"break-word",textAlign:"center",margin:"2px 2px",padding:"5px 5px"}}>{request.userName}</td>
           <td style={{wordWrap:"break-word",textAlign:"center",margin:"2px 2px",padding:"5px 5px"}}>{request.userEmail}</td>
           <td style={{wordWrap:"break-word",textAlign:"center",margin:"2px 2px",padding:"5px 5px"}}>{request.userPhone}</td>
           <td style={{textAlign:"center"}}>
             {request.cv_filename ? (
               <button className="btn btn-sm btn-outline-primary mx-2 my-3" onClick={() => downloadCv(request)}>Download PDF</button>
             ) : (
               <span className="text-muted">—</span>
             )}
           </td>
         </tr>
       
     )  
            
      )} </tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>{requests.total} application(s) — page {page} of {totalPages}</span>
              <div>
                <button className="btn btn-sm btn-secondary mx-1" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <button className="btn btn-sm btn-secondary mx-1" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            </div>
            </div>)}</div>);}
            export  default ManageRequests;
