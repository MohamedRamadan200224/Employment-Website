import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import Container from 'react-bootstrap/Container';
import Spinner from "react-bootstrap/Spinner";
import { FaBriefcase, FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageJobs.css";

// API base URL from env (REACT_APP_API_URL); default is the local dev backend.
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3306";

let deletenum = 0;
const ManageJobs = () => {
  const auth = getAuthUser();
  const [jobs, setJobs] = useState({
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });

  useEffect(() => {
    setJobs((prev) => ({ ...prev, loading: true }));
    axios
      // Perf P0: the list endpoint now returns the paginated envelope
      // { data, total, page, limit } — unwrap resp.data.data. limit=50
      // is the server cap, so the table keeps showing every job the
      // way the old unbounded list did (no pager on this page).
      .get(apiUrl + "/jobs?limit=50")
      .then((resp) => {
        console.log(resp);
        setJobs((prev) => ({ ...prev, results: resp.data.data || [], loading: false, err: null }));
      })
      .catch((err) => {
        setJobs((prev) => ({
          ...prev,
          loading: false,
          err: " something went wrong, please try again later ! ",
        }));
      });
  }, [jobs.reload]);

  const deleteJob = (id) => {
    axios
      .delete(apiUrl + "/jobs/" + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setJobs({
          ...jobs,
          loading: false,
          reload: jobs.reload + 1,
        });
        deletenum = 1;
      })
      .catch((err) => {
        setJobs({ ...jobs, loading: false });
      });
    deletenum = 2;
  };

  return (
    <div className="admin-page">
      <div className="admin-header mt-1">
        <Container>
          <h1 className="text-center text-white mb-0">
            <FaBriefcase className="header-icon" /> Job Management
          </h1>
        </Container>
      </div>

      <Container className="py-5">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-title">Manage Jobs</h3>
            <div className="admin-actions">
              {deletenum === 1 && (
                <Alert className="admin-alert admin-alert-success" variant="success">
                  Job deleted successfully
                </Alert>
              )}
              {deletenum === 2 && (
                <Alert className="admin-alert admin-alert-danger" variant="danger">
                  Couldn't delete job
                </Alert>
              )}
              <Link to={"add"} className="btn btn-success admin-btn-add">
                <FaPlus className="me-2" /> Add New Job
              </Link>
            </div>
          </div>

          {jobs.loading && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {!jobs.loading && jobs.err && (
            <Alert variant="danger" className="my-3">
              {jobs.err}
            </Alert>
          )}
 {jobs.loading === false && jobs.results.length === 0 && (
          <div className="text-center h-screen">
              <div className="no-requests-container">
                <div className="no-requests-icon">
                  <FaBriefcase />
                </div>
                <h4 className="no-requests-title">No Jobs Found</h4>
                <p className="no-requests-message">There are currently no jobs to apply for.</p>
              </div>
          </div>
        )}
          {!jobs.loading && !jobs.err && (
            <div className="table-responsive admin-table-container">
              <Table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Position</th>
                    <th>Field</th>
                    <th>Description</th>
                    <th>Max Candidates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.results.map((job) => {
                    return (
                      <tr key={job.id}>
                        <td>{job.id}</td>
                        <td>{job.position}</td>
                        <td>{job.field}</td>
                        <td className="description-cell">{job.description}</td>
                        <td>{job.maxcandidate}</td>
                        <td className="actions-cell">
                          <Link to={"/" + job.id} className="btn btn-info action-btn">
                            <FaEye />
                          </Link>
                          <Link to={"/manage-jobs/" + job.id} className="btn btn-primary action-btn">
                            <FaEdit />
                          </Link>
                          <button className="btn btn-danger action-btn" onClick={(e) => { deleteJob(job.id) }}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ManageJobs;