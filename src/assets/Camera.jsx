import { useEffect, useRef } from "react";

const Camera = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Unable to access camera.");
        if (mounted) onClose();
      }
    };

    startCamera();

    return () => {
      mounted = false;
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onClose]);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");

      stopCamera();
      onCapture(imageData);
      onClose();
    }
  };

  const handleCancel = () => {
    stopCamera();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.videoWrapper}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div style={styles.controls}>
          <button onClick={handleCancel} style={styles.cancelBtn}>
            ✕
          </button>
          <button onClick={handleCapture} style={styles.captureBtn} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    aspectRatio: "9 / 16", // auto-crop for portrait
    backgroundColor: "#000",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 0 16px rgba(0,0,0,0.5)",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  controls: {
    position: "absolute",
    bottom: "20px",
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtn: {
    width: "65px",
    height: "65px",
    backgroundColor: "#fff",
    border: "4px solid #aaa",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cancelBtn: {
    position: "absolute",
    top: "14px",
    right: "14px",
    fontSize: "1.5rem",
    color: "#fff",
    border: "none",
    background: "transparent",
    width: "36px",
    height: "36px",
    lineHeight: "36px",
    textAlign: "center",
    cursor: "pointer",
  },
};

export default Camera;
