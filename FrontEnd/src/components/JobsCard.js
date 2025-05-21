import React from "react";
import Card from 'react-bootstrap/Card';
import { Link } from "react-router-dom";
import { FaBriefcase, FaArrowRight, FaClock, FaDollarSign } from "react-icons/fa";

const JobsCard = (props) => {
  return (
    <Card className="job-card">
      <Card.Body>
        <div className="job-field">
          <FaBriefcase className="me-2" />
          {props.field}
        </div>
        <Card.Title>{props.position}</Card.Title>
        
        <div className="job-meta-info">
          <div className="job-meta-item">
            <FaDollarSign className="job-meta-icon" />
            <span>{props.salary}</span>
          </div>
          <div className="job-meta-item">
            <FaClock className="job-meta-icon" />
            <span>{props.workTime}</span>
          </div>
        </div>
        
        <Card.Text className="job-description">
          {props.description}
        </Card.Text>
        <Link className="btn btn-primary" to={"/" + props.id}>
          View Details <FaArrowRight className="ms-2" />
        </Link>
      </Card.Body>
    </Card>
  );
};

export default JobsCard;
