import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { getAuthUser } from "../../helper/Storage";
import Container from 'react-bootstrap/Container';
import Button from "react-bootstrap/Button";
import { FaClipboardCheck, FaFileAlt } from "react-icons/fa";
import "./RequestDetails.css";

// API base URL from env (REACT_APP_API_URL); default is the local dev backend.
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3306";

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
  const [cvDownloading, setCvDownloading] = useState(false);

  // Download the attached CV (PDF). A plain link cannot send the
  // token header the backend requires, so the file is fetched as a
  // blob with axios and saved from an object URL instead.
  const downloadCv = () => {
    if (!request.result || !request.result.cv_filename || cvDownloading) return;
    setCvDownloading(true);
    axios
      .get(apiUrl + "/requests-review/" + id + "/cv", {
        headers: {
          token: auth.token,
        },
        responseType: "blob",
      })
      .then((resp) => {
        const url = window.URL.createObjectURL(resp.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = request.result.cv_filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setCvDownloading(false);
      })
      .catch(() => {
        setCvDownloading(false);
      });
  };

  useEffect(() => {
    setRequest((prev) => ({ ...prev, loading: true }));
    axios
      .get(apiUrl + "/requests-review/" + id, {
        headers: {
          token: auth.token,
        }
      })
      .then((resp) => {
        setRequest((prev) => ({ ...prev, description: resp.data[0].description, result: resp.data[0], loading: false, err: null }));
        console.log(resp.data);
      })
      .catch((err) => {
        setRequest((prev) => ({
          ...prev,
          loading: false,
          err: "Something went wrong, please try again later!",
        }));
      });
  }, [id, auth.token]);

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
            {request.result.cv_filename && (
              <div className="request-details-section">
                <h3 className="request-section-title">CV</h3>
                <p>
                  {request.result.cv_filename}
                  {request.result.cv_size ? ` (${(request.result.cv_size / 1024).toFixed(0)} KB)` : ""}
                </p>
                <Button variant="primary" onClick={downloadCv} disabled={cvDownloading}>
                  {cvDownloading ? "Downloading..." : "Download CV (PDF)"}
                </Button>
              </div>
            )}
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