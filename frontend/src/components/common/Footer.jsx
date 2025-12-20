import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="dashboard-footer">
            <div className="footer-container">
                <div className="footer-left">
                    <span className="footer-brand">ROIMA</span>
                    <span className="footer-copyright">
                        &copy; {currentYear} All rights reserved.
                    </span>
                </div>

                <div className="footer-links">
                    <Link to="/privacy" className="footer-link"> Privacy Policy</Link>
                    <span className="footer-divider">•</span>
                    <Link to="/terms" className="footer-link">Terms of Service</Link>
                    <span className="footer-divider">•</span>
                    <Link to="/help" className="footer-link">Help Center</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;