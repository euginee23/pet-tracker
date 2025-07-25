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
  
  const footerStyle = {
    backgroundColor: '#212529',
    color: 'white',
    padding: '0.5rem 0',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: 0
  };

  return (
    <>
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
          <div className="row g-4 justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div style={iconStyle}>🔍</div>
                  <h5 className="card-title">Location Tracking</h5>
                  <p className="card-text">Monitor your pet's location at any time from anywhere.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div style={iconStyle}>🔔</div>
                  <h5 className="card-title">Instant Alerts</h5>
                  <p className="card-text">Get notifications when your pet leaves safe zones.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
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
      </div>
      
      {/* Footer */}
      <div style={footerStyle}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-center">
            <img src="/circle_logo_svg.svg" alt="Pet Tracker Logo" width="20" className="me-2" />
            <span style={{ fontSize: '0.9rem' }}>Pet Tracker | Codehub.site © 2025</span>
          </div>
        </div>
      </div>
      
      <div style={{ paddingBottom: '3rem' }}></div>
    </>
  );
}

export default Home;