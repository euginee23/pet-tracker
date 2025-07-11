import React from "react";
import { Modal, Button } from "react-bootstrap";

const ViewGeofenceInfoModal = ({ show, onClose, geofenceInfo }) => {
  if (!geofenceInfo) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Geofence Info</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Name:</strong> {geofenceInfo.name || "Unnamed"}</p>
        <p><strong>Type:</strong> {geofenceInfo.type}</p>
        <p><strong>Device ID:</strong> {geofenceInfo.deviceId}</p>
        {geofenceInfo.radius && (
          <p><strong>Radius:</strong> {geofenceInfo.radius} meters</p>
        )}
        {geofenceInfo.center && (
          <p><strong>Center:</strong> {geofenceInfo.center.lat}, {geofenceInfo.center.lng}</p>
        )}
        {geofenceInfo.coordinates && (
          <p><strong>Coordinates:</strong><br /> 
            <small style={{ fontSize: "0.8rem" }}>{JSON.stringify(geofenceInfo.coordinates)}</small>
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewGeofenceInfoModal;