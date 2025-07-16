import React from "react";
import { Modal, Button } from "react-bootstrap";

const ViewGeofenceInfoModal = ({ show, onClose, geofenceInfo }) => {
  if (!geofenceInfo) return null;

  const { name, type, radius, center, coordinates, deviceIds, deviceNames } =
    geofenceInfo;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header
        closeButton
        className="py-2 px-3"
        style={{ minHeight: "42px", backgroundColor: "#f7f7f7" }}
      >
        <Modal.Title style={{ fontSize: "1rem", lineHeight: "1.2" }}>
          Geofence Info
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Name:</strong> {name || "Unnamed"}
        </p>
        <p>
          <strong>Type:</strong> {type}
        </p>

        {Array.isArray(deviceIds) && deviceIds.length > 0 && (
          <div>
            <strong>Trackers:</strong>
            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
              {deviceIds.map((id, i) => (
                <li key={id}>
                  {deviceNames?.[i] ? (
                    <>
                      {deviceNames[i]} – <code>{id}</code>
                    </>
                  ) : (
                    <code>{id}</code>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {radius && (
          <p>
            <strong>Radius:</strong> {radius.toFixed(2)} meters
          </p>
        )}
        {center && (
          <p>
            <strong>Center:</strong> {center.lat}, {center.lng}
          </p>
        )}
        {coordinates && (
          <p>
            <strong>Coordinates:</strong>
            <br />
            <small style={{ fontSize: "0.8rem" }}>
              {JSON.stringify(coordinates)}
            </small>
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewGeofenceInfoModal;
