import { useNavigate } from "react-router-dom";
import { MdPets, MdHome, MdArrowBack } from "react-icons/md";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center"
      style={{
        minHeight: "calc(100vh - 120px)",
        backgroundColor: "#fdf6e3",
        padding: "2rem",
      }}
    >
      <div
        className="text-center"
        style={{
          maxWidth: "600px",
          padding: "3rem 2rem",
          backgroundColor: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e0d6c4",
        }}
      >
        {/* Large 404 with Pet Icon */}
        <div
          style={{
            fontSize: "8rem",
            fontWeight: "bold",
            color: "#5c4033",
            lineHeight: "1",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          4
          <MdPets
            size={80}
            style={{
              color: "#d4a574",
              margin: "0 0.5rem",
              animation: "bounce 2s infinite",
            }}
          />
          4
        </div>

        {/* Error Message */}
        <h2
          style={{
            color: "#5c4033",
            fontWeight: "600",
            marginBottom: "1rem",
            fontSize: "2rem",
          }}
        >
          Oops! Page Not Found
        </h2>

        <p
          style={{
            color: "#8b6914",
            fontSize: "1.1rem",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Looks like this pet wandered off! The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Action Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <button
            onClick={handleGoHome}
            className="btn"
            style={{
              backgroundColor: "#5c4033",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#4a3329";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#5c4033";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <MdHome size={20} />
            Go to Home
          </button>

          <button
            onClick={handleGoBack}
            className="btn"
            style={{
              backgroundColor: "transparent",
              color: "#5c4033",
              border: "2px solid #5c4033",
              borderRadius: "8px",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#5c4033";
              e.target.style.color = "white";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#5c4033";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <MdArrowBack size={20} />
            Go Back
          </button>
        </div>

        {/* Fun Pet Facts */}
        <div
          style={{
            marginTop: "3rem",
            padding: "1.5rem",
            backgroundColor: "#f8f5f0",
            borderRadius: "10px",
            border: "1px solid #e0d6c4",
          }}
        >
          <h6
            style={{
              color: "#5c4033",
              fontWeight: "600",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <MdPets size={16} />
            Did you know?
          </h6>
          <p
            style={{
              color: "#8b6914",
              fontSize: "0.9rem",
              margin: "0",
              fontStyle: "italic",
            }}
          >
            Cats can make over 100 different sounds, while dogs can only make about 10!
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
