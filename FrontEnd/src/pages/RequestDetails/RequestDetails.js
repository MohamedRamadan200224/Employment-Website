import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { getAuthUser } from "../../helper/Storage";
import Container from 'react-bootstrap/Container';
import { FaClipboardCheck, FaFileAlt } from "react-icons/fa";
import "./RequestDetails.css";

const RequestDetails = () => {
  let { id } = useParams();
  const auth = getAuthUser();
  const [request, setRequest] = useState({
    description: '',
    loading: true,
    result: null,
    err: null,
    reload: 0,
  });

  useEffect(() => {
    setRequest({ ...request, loading: true });
    axios
      .get("http://localhost:3306/requests-review/" + id, {
        headers: {
          token: auth.token,
        }
      })
      .then((resp) => {
        setRequest({ ...request, description: resp.data[0].description, result: resp.data[0], loading: false, err: null });
        console.log(resp.data);
      })
      .catch((err) => {
        setRequest({
          ...request,
          loading: false,
          err: "Something went wrong, please try again later!",
        });
      });
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <Container>
          <h1 className="text-center text-white mb-0">
            <FaFileAlt className="header-icon" /> Application Details
          </h1>
        </Container>
      </div>

      <Container className="py-5">
        {/* Loader */}
        {request.loading === true && (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {request.loading === false && request.err != null && (
          <Alert variant="danger" className="my-3">
            {request.err}
          </Alert>
        )}

        {request.loading === false && request.err == null && request.result && (
          <div className="admin-card">
            <div className="request-status-container">
              {request.result.applicationreview === 'Accepted' && (
                <div className="request-status request-status-accepted">
                  <FaClipboardCheck className="status-icon" />
                  <span>Application Accepted</span>
                </div>
              )}
              {request.result.applicationreview === 'Rejected' && (
                <div className="request-status request-status-rejected">
                  <FaClipboardCheck className="status-icon" />
                  <span>Application Rejected</span>
                </div>
              )}
            </div>

            <div className="request-details-section">
              <h3 className="request-section-title">Applicant Request</h3>
              <div className="request-description">
                {request.description}
              </div>
            </div>
          </div>
        )}

        {request.loading === false && request.err == null && !request.result && (
          <Alert variant="danger" className="my-3">
            No Request found, please try again later!
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default RequestDetails;