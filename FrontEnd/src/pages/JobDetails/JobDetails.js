import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { getAuthUser } from "../../helper/Storage";
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FaFileAlt, FaMoneyBillWave, FaGraduationCap, FaUsers, FaPaperPlane } from "react-icons/fa";
import "./JobDetails.css";
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

// Sample job data for development environment
const sampleJobDetails = {
    1: {
        id: 1,
        position: "Frontend Developer",
        field: "Web Development",
        description: "We are looking for a skilled frontend developer with experience in React.js to join our team. You will be responsible for building user interfaces, implementing responsive designs, and collaborating with backend developers.",
        offer: "90,000",
        workTime: "Full-time",
        qualifications: "3+ years of experience with React, JavaScript, HTML, and CSS. Familiarity with modern frontend tools and practices. Bachelor's degree in Computer Science or related field preferred.",
        maxcandidate: 5
    },
    2: {
        id: 2,
        position: "Backend Engineer",
        field: "Software Engineering",
        description: "Join our backend team to build scalable and efficient server-side applications. You'll work on API development, database design, and system architecture.",
        offer: "100,000",
        workTime: "Full-time",
        qualifications: "Experience with Node.js, Express, and SQL/NoSQL databases. Knowledge of RESTful API design principles. Strong problem-solving skills and attention to detail.",
        maxcandidate: 3
    },
    3: {
        id: 3,
        position: "UI/UX Designer",
        field: "Design",
        description: "Create beautiful and intuitive user interfaces for our web and mobile applications. You'll be responsible for the entire design process from wireframing to final implementation.",
        offer: "85,000",
        workTime: "Full-time",
        qualifications: "Portfolio showcasing UI/UX projects, proficiency in Figma or Adobe XD. Understanding of user-centered design principles and accessibility standards.",
        maxcandidate: 2
    },
    4: {
        id: 4,
        position: "DevOps Engineer",
        field: "Infrastructure",
        description: "Help us build and maintain our cloud infrastructure and deployment pipelines. You'll be responsible for automation, monitoring, and ensuring system reliability.",
        offer: "110,000",
        workTime: "Full-time",
        qualifications: "Experience with AWS, Docker, Kubernetes, and CI/CD pipelines. Knowledge of infrastructure as code tools like Terraform. Strong scripting skills.",
        maxcandidate: 1
    },
    5: {
        id: 5,
        position: "Data Scientist",
        field: "Data Science",
        description: "Analyze large datasets and build machine learning models to drive business decisions. You'll work with stakeholders to identify opportunities for data-driven improvements.",
        offer: "105,000",
        workTime: "Full-time",
        qualifications: "Strong background in statistics, machine learning, and programming (Python, R). Experience with data visualization tools and big data technologies.",
        maxcandidate: 2
    },
    6: {
        id: 6,
        position: "Mobile Developer",
        field: "Mobile Development",
        description: "Develop cross-platform mobile applications using React Native. You'll be responsible for the entire mobile development lifecycle from concept to deployment.",
        offer: "95,000",
        workTime: "Full-time",
        qualifications: "Experience with React Native, JavaScript, and mobile app deployment. Understanding of mobile UI/UX principles and app store requirements.",
        maxcandidate: 3
    }
};

// Check if we should use mock data — one switch for the whole
// frontend (see Home.js): mock data is on only when
// REACT_APP_USE_MOCK_DATA is 'true'. The old check on REACT_APP_ENV
// === 'development' kept this page on mock data in production,
// because the production build has REACT_APP_ENV=development baked
// in, so the application form (and the CV upload) never rendered
// there and real jobs showed "Job not found!".
const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3306';

// CV upload limit — must match the backend (BackEnd/middleware/uploadCv.js).
const MAX_CV_SIZE = 5 * 1024 * 1024; // 5 MB

const JobDetails = () => {
    let { id } = useParams();
    const auth = getAuthUser();
    const [job, setJob] = useState({
        loading: true,
        result: null,
        err: null,
        reload: 0,
    });

    const [description, setDescription] = useState({
        description: "",
        loading: false,
        err: null,
    });

    // CV (PDF) upload: optional. Validated client-side (type / size /
    // %PDF- magic bytes) before anything is sent, so an invalid file
    // fails instantly instead of after a slow upload. The backend
    // enforces the same checks (see BackEnd/middleware/uploadCv.js).
    const cvInputRef = useRef(null);
    const [cv, setCv] = useState({
        file: null,
        error: null,
        progress: 0,
    });

    const handleCvChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const fail = (message) => {
            if (cvInputRef.current) cvInputRef.current.value = "";
            setCv({ file: null, error: message, progress: 0 });
        };
        if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
            return fail("Only PDF files are accepted for the CV.");
        }
        if (file.size > MAX_CV_SIZE) {
            return fail("CV is too large — the maximum size is 5 MB.");
        }
        try {
            const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
            if (String.fromCharCode(...head) !== "%PDF-") {
                return fail("That file is not a valid PDF.");
            }
        } catch (err) {
            return fail("Could not read the CV file, please try again.");
        }
        setCv({ file: file, error: null, progress: 0 });
    };

    const removeCv = () => {
        if (cvInputRef.current) cvInputRef.current.value = "";
        setCv({ file: null, error: null, progress: 0 });
    };

    useEffect(() => {
        setJob((prev) => ({ ...prev, loading: true }));
        
        if (useMockData) {
            // Use mock data when REACT_APP_USE_MOCK_DATA is 'true'
            setTimeout(() => {
                // Convert id to number since URL params are strings
                const jobId = parseInt(id);
                const mockJob = sampleJobDetails[jobId];
                
                if (mockJob) {
                    setJob((prev) => ({ ...prev, result: mockJob, loading: false, err: null }));
                } else {
                    setJob((prev) => ({
                        ...prev,
                        loading: false,
                        err: "Job not found!",
                    }));
                }
            }, 500); // Simulate network delay
        } else {
            // Use real API otherwise
            axios
                .get(`${apiUrl}/jobs/${id}`)
                .then((resp) => {
                    setJob((prev) => ({ ...prev, result: resp.data, loading: false, err: null }));
                })
                .catch((err) => {
                    // A missing job is a 404 now (see GET /jobs/:id):
                    // show "No job found" instead of the generic error.
                    const message =
                        err.response && err.response.status === 404
                            ? "No job found, please try again later!"
                            : "Something went wrong, please try again later!";
                    setJob((prev) => ({
                        ...prev,
                        loading: false,
                        err: message,
                    }));
                });
        }
    }, [job.reload, id]);

    const sendRequest = (e) => {
        e.preventDefault();
        if (description.loading) return;
        setDescription({ ...description, loading: true, err: null });
        setCv((prev) => ({ ...prev, progress: 0 }));
        
        if (useMockData) {
            // Simulate API call when mock data is on
            setTimeout(() => {
                setDescription({ err: null, description: "", loading: false });
                setCv({ file: null, error: null, progress: 0 });
                setJob({ ...job, reload: job.reload + 1 });
            }, 1000);
        } else {
            // Use real API otherwise. FormData (not JSON) so
            // the optional CV file can ride along; the backend accepts
            // applications with and without a file. onUploadProgress
            // drives the progress bar — on a slow connection the user
            // sees the upload moving instead of a stuck spinner — and
            // the 120s timeout surfaces a clear error instead of hanging.
            const formData = new FormData();
            formData.append("job_id", id);
            formData.append("description", description.description);
            formData.append("date", new Date().toDateString());
            if (cv.file) formData.append("cv", cv.file);
            axios
                .post(`${apiUrl}/jobs/request`, formData, {
                    headers: {
                        token: auth.token,
                    },
                    timeout: 120000,
                    onUploadProgress: (event) => {
                        if (!event.total) return;
                        setCv((prev) => ({ ...prev, progress: Math.round((event.loaded * 100) / event.total) }));
                    },
                })
                .then((resp) => {
                    setDescription({ err: null, description: "", loading: false });
                    setCv({ file: null, error: null, progress: 0 });
                    setJob({ ...job, reload: job.reload + 1 });
                })
                .catch((error) => {
                    let message = "Something went wrong, please try again later!";
                    if (error.code === "ECONNABORTED") {
                        message = "Upload timed out — check your connection and try again.";
                    } else if (error.response && error.response.status === 413) {
                        message = "CV is too large — the maximum size is 5 MB.";
                    } else if (error.response && error.response.data && error.response.data.message) {
                        message = error.response.data.message;
                    } else if (error.response && error.response.data && error.response.data.msg) {
                        message = error.response.data.msg;
                    }
                    setDescription({ ...description, loading: false, err: message });
                    setCv((prev) => ({ ...prev, progress: 0 }));
                });
        }
    };

    return (
        <div className="job-details-page">
            <div className="job-details-header mt-1">
                <Container>
                    <h1 className="text-center text-white mb-0">Job Details</h1>
                    {useMockData && (
                        <div className="text-center mt-2">
                            <span className="badge bg-warning">Using Mock Data</span>
                        </div>
                    )}
                </Container>
            </div>

            <Container className="py-5">
                {/* Loader */}
                {job.loading === true && (
                    <div className="text-center my-5">
                        <Spinner animation="border" role="status" variant="primary">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )}

                {job.loading === false && job.err == null && job.result && (
                    <>
                        {!auth && (
                            <Alert variant="info" className="mb-4">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <span>Login or Sign Up to apply for this job</span>
                                </div>
                            </Alert>
                        )}

                        <div className="job-details-container">
                            <div className="job-header mb-4">
                                <h2 className="job-title">{job.result.position}</h2>
                                <div className="job-field-badge">{job.result.field}</div>
                            </div>

                            <Row className="job-info-grid">
                                <Col md={6} className="mb-4">
                                    <div className="job-info-card">
                                        <div className="job-info-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="job-info-content">
                                            <h3 className="job-info-title">Description</h3>
                                            <p className="job-info-text">{job.result.description}</p>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <div className="job-info-card">
                                        <div className="job-info-icon">
                                            <FaMoneyBillWave />
                                        </div>
                                        <div className="job-info-content">
                                            <h3 className="job-info-title">Offer</h3>
                                            <p className="job-info-text">{job.result.offer}</p>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <div className="job-info-card">
                                        <div className="job-info-icon">
                                            <FaGraduationCap />
                                        </div>
                                        <div className="job-info-content">
                                            <h3 className="job-info-title">Qualifications</h3>
                                            <p className="job-info-text">{job.result.qualifications}</p>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <div className="job-info-card">
                                        <div className="job-info-icon">
                                            <FaUsers />
                                        </div>
                                        <div className="job-info-content">
                                            <h3 className="job-info-title">Maximum Candidates</h3>
                                            <p className="job-info-text">{job.result.maxcandidate}</p>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* The form is for regular users only (type 1 = admin).
                                `type` is 0 for a regular user — but sessions stored
                                before the register response carried `type` have
                                auth.type === undefined, so gate on "not an admin"
                                instead of "type is exactly 0", or a freshly
                                registered user never sees the form. */}
                            {auth && job.reload === 0 && auth.type !== 1 && (
                                <div className="application-form-container">
                                    <h3 className="application-form-title">
                                        <FaPaperPlane className="me-2" />
                                        Apply for this Position
                                    </h3>
                                    <Form onSubmit={sendRequest}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tell us about your qualifications</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                placeholder="Describe your experience, skills, and why you're a good fit for this position..."
                                                value={description.description}
                                                onChange={(e) => setDescription({ ...description, description: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>CV (PDF, optional, max 5 MB)</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="application/pdf,.pdf"
                                                ref={cvInputRef}
                                                onChange={handleCvChange}
                                                disabled={description.loading === true}
                                            />
                                            <Form.Text className="text-muted">
                                                Your CV is stored with your application so the employer can download it. PDF only, up to 5 MB.
                                            </Form.Text>
                                            {cv.file && (
                                                <div className="mt-2 d-flex align-items-center gap-2">
                                                    <span>{cv.file.name} ({(cv.file.size / 1024).toFixed(0)} KB)</span>
                                                    <Button variant="outline-secondary" size="sm" type="button" onClick={removeCv} disabled={description.loading === true}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                            {cv.error && (
                                                <Alert variant="danger" className="mt-2 mb-0">{cv.error}</Alert>
                                            )}
                                            {description.loading === true && cv.file && cv.progress > 0 && (
                                                <ProgressBar now={cv.progress} label={`${cv.progress}%`} className="mt-2" />
                                            )}
                                        </Form.Group>


                                        {description.err && (
                                            <Alert variant="danger">{description.err}</Alert>
                                        )}

                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            className="application-submit-btn"
                                            disabled={description.loading === true}
                                        >
                                            {description.loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>Submit Application</>
                                            )}
                                        </Button>
                                    </Form>
                                </div>
                            )}

                            {auth && job.reload !== 0 && (
                                <Alert variant="success" className="application-success">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-check-circle me-2"></i>
                                        <span>Your application has been submitted successfully!</span>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    </>
                )}

                {job.loading === false && job.err != null && (
                    <Alert variant="danger" className="p-4 text-center">
                        {job.err}
                    </Alert>
                )}

                {job.loading === false && job.err == null && !job.result && (
                    <Alert variant="danger" className="p-4 text-center">
                        No job found, please try again later!
                    </Alert>
                )}
            </Container>
        </div>
    );
};

export default JobDetails;
