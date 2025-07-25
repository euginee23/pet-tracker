import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const heroStyle = {
    backgroundImage: 'url("/bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    color: 'white',
    padding: '4rem 0',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
  };

  const iconStyle = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  };

  const stepNumberStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div style={heroStyle} className="text-center">
        <div style={overlayStyle}></div>
        <div className="container" style={contentStyle}>
          <img src="/circle_logo_svg.svg" alt="Pet Tracker Logo" className="mb-3" width="100" />
          <h1 className="display-5 fw-bold mb-3">Keep Your Pets Safe & Secure</h1>
          <p className="lead mb-4">Track your pet's location in real-time, create safety zones, and receive instant alerts.</p>
          
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg px-4 mb-5">Go to Dashboard</Link>
          ) : (
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
              <Link to="/login" className="btn btn-primary btn-lg px-4">Sign In</Link>
              <Link to="/register" className="btn btn-outline-light btn-lg px-4">Create Account</Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <h2 className="text-center mb-4">Why Choose Pet Tracker?</h2>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div style={iconStyle}>🔍</div>
                <h5 className="card-title">Location Tracking</h5>
                <p className="card-text">Monitor your pet's location at any time from anywhere.</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div style={iconStyle}>🔔</div>
                <h5 className="card-title">Instant Alerts</h5>
                <p className="card-text">Get notifications when your pet leaves safe zones.</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div style={iconStyle}>🛡️</div>
                <h5 className="card-title">Geofencing</h5>
                <p className="card-text">Create custom safety areas for your pets.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container py-4">
        <h2 className="text-center mb-4">How It Works</h2>
        <div className="row g-4 justify-content-center">
          <div className="col-md-4 text-center">
            <div style={stepNumberStyle}>1</div>
            <h5>Purchase our Collar-Tracker</h5>
            <p className="text-muted">Connect our lightweight tracker to your pet's collar.</p>
          </div>
          <div className="col-md-4 text-center">
            <div style={stepNumberStyle}>2</div>
            <h5>Set Up Your Account</h5>
            <p className="text-muted">Register and configure your preferences in minutes.</p>
          </div>
          <div className="col-md-4 text-center">
            <div style={stepNumberStyle}>3</div>
            <h5>Start Tracking</h5>
            <p className="text-muted">View your pet's location on our interactive map.</p>
          </div>
        </div>
      </div>

      {/* Testimonials in a Compact Card Format */}
      <div className="bg-light py-4">
        <div className="container">
          <h2 className="text-center mb-4">What Pet Owners Say</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <p className="card-text fst-italic">"Pet Tracker gave me peace of mind when my dog went missing. I found him within minutes!"</p>
                  <p className="card-text text-end fw-bold">— Maria S.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <p className="card-text fst-italic">"The geofencing feature is incredible. I get alerts whenever my cat wanders too far from home."</p>
                  <p className="card-text text-end fw-bold">— James T.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <img src="/circle_logo_svg.svg" alt="Pet Tracker Logo" width="60" className="me-2" />
              <span>Pet Tracker &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <Link to="/privacy" className="text-white text-decoration-none me-3">Privacy</Link>
              <Link to="/terms" className="text-white text-decoration-none me-3">Terms</Link>
              <Link to="/contact" className="text-white text-decoration-none">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;