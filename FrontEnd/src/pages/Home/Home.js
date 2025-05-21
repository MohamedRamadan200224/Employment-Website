import React, { useState, useEffect } from "react";
import JobsCard from "../../components/JobsCard";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaSearch, FaBriefcase } from "react-icons/fa";
import "./Home.css"; // Import the CSS file

// Sample jobs data for development environment
const sampleJobs = [
  {
    id: 1,
    position: "Frontend Developer",
    field: "Web Development",
    description: "We are looking for a skilled frontend developer with experience in React.js to join our team.",
    offer: "90,000",
    workTime: "Full-time",
    qualifications: "3+ years of experience with React, JavaScript, HTML, and CSS",
    maxcandidate: 5
  },
  {
    id: 2,
    position: "Backend Engineer",
    field: "Software Engineering",
    description: "Join our backend team to build scalable and efficient server-side applications.",
    offer: "100,000",
    workTime: "Full-time",
    qualifications: "Experience with Node.js, Express, and SQL/NoSQL databases",
    maxcandidate: 3
  },
  {
    id: 3,
    position: "UI/UX Designer",
    field: "Design",
    description: "Create beautiful and intuitive user interfaces for our web and mobile applications.",
    offer: "85,000",
    workTime: "Full-time",
    qualifications: "Portfolio showcasing UI/UX projects, proficiency in Figma or Adobe XD",
    maxcandidate: 2
  },
  {
    id: 4,
    position: "DevOps Engineer",
    field: "Infrastructure",
    description: "Help us build and maintain our cloud infrastructure and deployment pipelines.",
    offer: "110,000",
    workTime: "Full-time",
    qualifications: "Experience with AWS, Docker, Kubernetes, and CI/CD pipelines",
    maxcandidate: 1
  },
  {
    id: 5,
    position: "Data Scientist",
    field: "Data Science",
    description: "Analyze large datasets and build machine learning models to drive business decisions.",
    offer: "105,000",
    workTime: "Full-time",
    qualifications: "Strong background in statistics, machine learning, and programming (Python, R)",
    maxcandidate: 2
  },
  {
    id: 6,
    position: "Mobile Developer",
    field: "Mobile Development",
    description: "Develop cross-platform mobile applications using React Native.",
    offer: "95,000",
    workTime: "Full-time",
    qualifications: "Experience with React Native, JavaScript, and mobile app deployment",
    maxcandidate: 3
  }
];

// Check if we should use mock data from environment variable
// Add console log to debug environment variables
console.log("Environment variables:", {
  useMockData: process.env.REACT_APP_USE_MOCK_DATA,
  apiUrl: process.env.REACT_APP_API_URL,
  nodeEnv: process.env.NODE_ENV
});

// Force mock data for testing (you can remove this line later)
const useMockData = true; // process.env.REACT_APP_USE_MOCK_DATA === 'true';
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3306';

const Home = () => {
  const [jobs, setJobs] = useState({
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    setJobs({ ...jobs, loading: true });
    
    if (useMockData) {
      // Use sample data when REACT_APP_USE_MOCK_DATA is true
      setTimeout(() => {
        let filteredJobs = sampleJobs;
        if (search) {
          filteredJobs = sampleJobs.filter(job => 
            job.position.toLowerCase().includes(search.toLowerCase()) ||
            job.field.toLowerCase().includes(search.toLowerCase()) ||
            job.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        setJobs({ ...jobs, results: filteredJobs, loading: false, err: null });
      }, 500); // Simulate network delay
    } else {
      // Use real API when REACT_APP_USE_MOCK_DATA is false
      axios
        .get(`${apiUrl}/jobs`, {
          params: {
            search: search,
          },
        })
        .then((resp) => {
          setJobs({ ...jobs, results: resp.data, loading: false, err: null });
        })
        .catch((err) => {
          setJobs({
            ...jobs,
            loading: false,
            err: "Something went wrong, please try again later!",
          });
        });
    }
  }, [jobs.reload]);

  const searchJobs = (e) => {
    e.preventDefault();
    setJobs({ ...jobs, reload: jobs.reload + 1 });
  };

  return (
    <div className="home-page-wrapper">
      <div className="hero-section text-center py-5 mb-5">
        <Container>
          <h1 className="display-4 text-white fw-bold mb-4">Find Your Dream Job</h1>
          <p className="lead text-white mb-5">Discover opportunities that match your skills and career goals</p>
          
          <Form className="search-form mx-auto" onSubmit={searchJobs}>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Search for jobs..."
                className="form-control-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary btn-lg" type="submit">
                <FaSearch className="me-2" /> Search
              </button>
            </div>
          </Form>
        </Container>
      </div>

      <Container>
        <div className="section-header d-flex align-items-center mb-4">
          <FaBriefcase className="section-icon me-3" />
          <h2 className="fw-bold m-0">Available Positions</h2>
          {useMockData && (
            <span className="badge bg-warning ms-3">Using Mock Data ({process.env.REACT_APP_ENV})</span>
          )}
        </div>

        {jobs.loading && (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!jobs.loading && jobs.err && (
          <Alert variant="danger" className="p-4 text-center">
            {jobs.err}
          </Alert>
        )}

        {!jobs.loading && !jobs.err && jobs.results.length === 0 && (
          <Alert variant="info" className="p-4 text-center">
            <p className="mb-0">No jobs found. Please try a different search term or check back later!</p>
          </Alert>
        )}

        {!jobs.loading && !jobs.err && jobs.results.length > 0 && (
          <Row className="g-4">
            {jobs.results.map((job) => (
              <Col xs={12} sm={6} md={6} lg={4} key={job.id}>
                <JobsCard
                  position={job.position}
                  field={job.field}
                  description={job.description}
                  id={job.id}
                  salary={job.offer || "Competitive"}
                  workTime={job.workTime || "Full-time"}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Home;
