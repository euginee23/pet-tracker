import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const DeleteGeofenceModal = ({ show, onClose, onConfirm, geofenceInfo }) => {
  const [loading, setLoading] = useState(false);

  if (!geofenceInfo) return null;

  const deviceIds = Array.isArray(geofenceInfo.deviceIds)
    ? geofenceInfo.deviceIds
    : geofenceInfo.deviceId
    ? [geofenceInfo.deviceId]
    : [];

  const hasMultipleIds =
    Array.isArray(geofenceInfo.geofence_ids) &&
    geofenceInfo.geofence_ids.length > 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={loading ? null : onClose}
      centered
      backdrop="static"
      size="md"
      dialogClassName="delete-geofence-modal"
    >
      <Modal.Header
        closeButton={!loading}
        className="bg-danger-subtle py-2 px-3"
        style={{ minHeight: "45px" }}
      >
        <Modal.Title
          className="text-danger fw-semibold"
          style={{ fontSize: "1rem", lineHeight: "1.2" }}
        >
          Confirm Geofence Deletion
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#fff9f9" }}>
        <div className="text-dark mb-3">
          Are you sure you want to remove the following geofence?
        </div>

        <div style={{ fontSize: "0.9rem", color: "#333" }}>
          <div className="mb-2">
            <strong>Geofence ID{hasMultipleIds ? "s" : ""}:</strong>{" "}
            {hasMultipleIds ? (
              <ul className="mb-1 ps-3">
                {geofenceInfo.geofence_ids.map((id, i) => (
                  <li key={i} className="small">
                    {id}
                  </li>
                ))}
              </ul>
            ) : (
              geofenceInfo.geofence_id || "N/A"
            )}
          </div>

          <div className="mb-2">
            <strong>Geofence For:</strong>{" "}
            {geofenceInfo?.deviceNames?.length > 0
              ? geofenceInfo.deviceNames
                  .map((name, i) => {
                    const id = geofenceInfo.deviceIds?.[i] || "Unknown ID";
                    return `${name} (${id})`;
                  })
                  .join(", ")
              : "N/A"}
          </div>

          <div className="mb-2">
            <strong>Name:</strong> {geofenceInfo.name || "Unnamed"}
          </div>

          <div className="mb-2">
            <strong>Type:</strong> {geofenceInfo.type || "Unknown"}
          </div>

          {geofenceInfo.type === "Circle" && (
            <>
              <div className="mb-2">
                <strong>Radius:</strong> {geofenceInfo.radius} meters
              </div>
              {geofenceInfo.center && (
                <div className="mb-2">
                  <strong>Center:</strong> {geofenceInfo.center.lat},{" "}
                  {geofenceInfo.center.lng}
                </div>
              )}
            </>
          )}

          {(geofenceInfo.type === "Polygon" ||
            geofenceInfo.type === "Rectangle") &&
            geofenceInfo.coordinates && (
              <div className="mb-2">
                <strong>Coordinates:</strong>
                <div
                  className="small text-muted mt-1"
                  style={{
                    maxHeight: "100px",
                    overflowY: "auto",
                    backgroundColor: "#f8f8f8",
                    border: "1px solid #ddd",
                    padding: "6px",
                    borderRadius: "4px",
                    wordBreak: "break-word",
                  }}
                >
                  {JSON.stringify(geofenceInfo.coordinates)}
                </div>
              </div>
            )}
        </div>

        <div className="text-danger fw-bold mt-4">
          This action cannot be undone.
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-danger-subtle d-flex justify-content-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            "Remove Geofence"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteGeofenceModal;
