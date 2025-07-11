import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteGeofenceModal = ({ show, onClose, onConfirm, geofenceInfo }) => {
  if (!geofenceInfo) return null;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      size="md"
      dialogClassName="delete-geofence-modal"
    >
      <Modal.Header closeButton className="bg-danger-subtle">
        <Modal.Title className="text-danger fw-semibold">
          Confirm Geofence Deletion
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#fff9f9" }}>
        <p className="mb-3 text-dark">
          Are you sure you want to remove the following geofence?
        </p>

        <div style={{ fontSize: "0.9rem" }}>
          <ul className="ps-3">
            <li>
              <strong>Geofence ID:</strong> {geofenceInfo.geofence_id || "N/A"}
            </li>
            <li>
              <strong>Geofence For:</strong> {geofenceInfo.deviceId || "N/A"}
            </li>
            <li>
              <strong>Name:</strong> {geofenceInfo.name || "Unnamed"}
            </li>
            <li>
              <strong>Type:</strong> {geofenceInfo.type || "Unknown"}
            </li>
            {geofenceInfo.type === "Circle" && (
              <>
                <li>
                  <strong>Radius:</strong> {geofenceInfo.radius} meters
                </li>
                {geofenceInfo.center && (
                  <li>
                    <strong>Center:</strong> {geofenceInfo.center.lat},{" "}
                    {geofenceInfo.center.lng}
                  </li>
                )}
              </>
            )}

            {(geofenceInfo.type === "Polygon" ||
              geofenceInfo.type === "Rectangle") &&
              geofenceInfo.coordinates && (
                <li>
                  <strong>Coordinates:</strong>
                  <br />
                  <div
                    className="small text-muted"
                    style={{
                      maxHeight: "80px",
                      overflowY: "auto",
                      backgroundColor: "#f8f8f8",
                      border: "1px solid #ddd",
                      padding: "6px",
                      borderRadius: "4px",
                      wordBreak: "break-all",
                      marginTop: "4px",
                    }}
                  >
                    {JSON.stringify(geofenceInfo.coordinates)}
                  </div>
                </li>
              )}
          </ul>
        </div>

        <p className="text-danger fw-bold mt-3">
          This action cannot be undone.
        </p>
      </Modal.Body>

      <Modal.Footer className="bg-danger-subtle d-flex justify-content-between">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          Remove Geofence
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteGeofenceModal;
