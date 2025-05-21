import {React, useState, useEffect} from "react";
import Alert from "react-bootstrap/Alert";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import "../../css/Register.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import { useParams } from "react-router-dom";
import "./UpdateJob.css";

let updatenum = 0;

const UpdateJob = () => {
  const auth = getAuthUser();
  const {id} = useParams();
  const [updatejob, setUpdateJob] = useState({
    position: "",
    field: "",
    description: "",
    offer: "",
    qualifications: "",
    maxcandidate: "",
    loading: false,
    fetchLoading: true,
    err: '',
    success: '',
  });

  // Fetch job data when component mounts
  useEffect(() => {
    axios
      .get(`http://localhost:3306/jobs/${id}`)
      .then((resp) => {
        const jobData = resp.data;
        setUpdateJob({
          ...updatejob,
          position: jobData.position || "",
          field: jobData.field || "",
          description: jobData.description || "",
          offer: jobData.offer || "",
          qualifications: jobData.qualifications || "",
          maxcandidate: jobData.maxcandidate || "",
          fetchLoading: false,
        });
      })
      .catch((error) => {
        setUpdateJob({
          ...updatejob,
          fetchLoading: false,
          err: "Failed to load job data",
        });
      });
  }, [id]);

  const UpdateFun = (id) => {
    setUpdateJob({ ...updatejob, loading: true, err: [] });
    axios
      .put("http://localhost:3306/jobs/"+id, {
        position: updatejob.position,
        field: updatejob.field,
        description: updatejob.description,
        offer: updatejob.offer,
        qualifications: updatejob.qualifications,
        maxcandidate: updatejob.maxcandidate,
      }, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setUpdateJob({ ...updatejob, success: "UPDATED JOB SUCCESSFULLY", loading: false, err: [] });
        updatenum = 1;
      })
      .catch((errors) => {
        setUpdateJob({
          ...updatejob,
          loading: false,
          success: null,
          err: "Couldn't Update Job",
        });
        updatenum = 2;
      });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="text-center text-white mb-0">Update Job</h1>
        </div>
      </div>

      <div className="container py-5">
        <div className="admin-card">
          {updatejob.fetchLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {auth.type === 1 && updatenum === 1 && (
                <Alert className="px-2 py-2" variant="success">
                  Updated Job Successfully
                </Alert>
              )}
              {auth.type === 1 && updatenum === 2 && (
                <Alert className="px-2 py-2" variant="danger">
                  Job Couldn't Be Updated
                </Alert>
              )}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Position: </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Please Enter Job Position" 
                    value={updatejob.position}
                    onChange={(e) => setUpdateJob({ ...updatejob, position: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Field: </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Please Enter Field" 
                    value={updatejob.field}
                    onChange={(e) => setUpdateJob({ ...updatejob, field: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description: </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5}
                    placeholder="Please Enter Description" 
                    value={updatejob.description}
                    onChange={(e) => setUpdateJob({ ...updatejob, description: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Offer: </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Please Enter Offer" 
                    value={updatejob.offer}
                    onChange={(e) => setUpdateJob({ ...updatejob, offer: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Qualifications: </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5}
                    placeholder="Please Enter Job Qualifications" 
                    value={updatejob.qualifications}
                    onChange={(e) => setUpdateJob({ ...updatejob, qualifications: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Candidates: </Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="Please Enter Max. Candidates number" 
                    value={updatejob.maxcandidate}
                    onChange={(e) => setUpdateJob({ ...updatejob, maxcandidate: e.target.value })}
                  />
                </Form.Group>
                <Button 
                  className="btn btn-primary w-100" 
                  type="button" 
                  onClick={(e) => {UpdateFun(id)}} 
                  disabled={updatejob.loading === true}
                >
                  {updatejob.loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Updating...</span>
                    </>
                  ) : (
                    "Update Job"
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

export default UpdateJob;