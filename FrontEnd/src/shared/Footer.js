import React from "react";
import "../css/Footer.css";
import { FaHeart, FaLinkedin, FaTwitter, FaFacebook, FaGithub } from "react-icons/fa";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <Container>
        <Row className="py-4">
          <Col md={4} className="footer-about mb-4 mb-md-0">
            <h5 className="footer-heading text-white">About Us</h5>
            <p className="footer-text">
              We connect talented professionals with the best companies. Our platform makes job searching and hiring simple and efficient.
            </p>
          </Col>
          
          <Col md={4} className="footer-links mb-4 mb-md-0">
            <h5 className="footer-heading text-white">Quick Links</h5>
            <ul className="footer-list">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/login" className="footer-link">Login</a></li>
              <li><a href="/register" className="footer-link">Register</a></li>
            </ul>
          </Col>
          
          <Col md={4} className="footer-social">
            <h5 className="footer-heading text-white">Connect With Us</h5>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaLinkedin /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaFacebook /></a>
              <a href="#" className="social-icon"><FaGithub /></a>
            </div>
          </Col>
        </Row>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Job App. All rights reserved. Made with <FaHeart className="heart-icon" />
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;