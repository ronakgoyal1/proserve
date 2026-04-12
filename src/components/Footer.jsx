import { Link } from 'react-router-dom';
import { Shield, Globe, Play } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ color: 'white' }}>
              <div className="logo-icon">
                <Shield size={18} />
              </div>
              Pro<span>Serve</span>
            </Link>
            <p>
              India's most trusted platform to find verified Chartered Accountants
              and Cost & Management Accountants for all your finance and compliance needs.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><Globe size={18} /></a>
              <a href="#" aria-label="YouTube"><Play size={18} /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><Link to="/search?service=itr">ITR Filing</Link></li>
              <li><Link to="/search?service=gst">GST Services</Link></li>
              <li><Link to="/search?service=audit">Audit Support</Link></li>
              <li><Link to="/search?service=registration">Company Registration</Link></li>
              <li><Link to="/search?service=cost">Cost Analysis</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>For Professionals</h4>
            <ul>
              <li><Link to="/login?tab=signup&role=professional">Join as Expert</Link></li>
              <li><Link to="/login?tab=signup&role=professional">Pricing Plans</Link></li>
              <li><Link to="/about">Partner Program</Link></li>
              <li><Link to="/about">Success Stories</Link></li>
              <li><Link to="/contact">Help Center</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/about">Careers</Link></li>
              <li><Link to="/about">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/about">Press</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ProServe. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
