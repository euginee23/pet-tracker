import React, { useState } from "react";
import { Modal, Button, Form, ListGroup, Spinner } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";

const SelectDeviceModal = ({
  show,
  devices,
  onClose,
  onConfirm,
  saving,
  setSaving,
}) => {
  const [geofenceName, setGeofenceName] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);

  const handleConfirm = async () => {
    if (!geofenceName.trim()) {
      alert("Please enter a geofence name.");
      return;
    }
    if (selectedDeviceIds.length === 0) {
      alert("Please select at least one device.");
      return;
    }

    const selectedDevices = devices.filter((d) =>
      selectedDeviceIds.includes(d.deviceId || d.device_id)
    );

    setSaving(true);
    try {
      await onConfirm(
        selectedDevices.map((d) => ({
          ...d,
          geofenceName: geofenceName.trim(),
        }))
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeviceSelect = (id) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="py-2 px-3">
        <Modal.Title className="fs-6 fw-semibold">Select a Device</Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-2 px-3">
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold small mb-1">
            Geofence Name
          </Form.Label>
          <Form.Control
            type="text"
            size="sm"
            placeholder="e.g. Home Area"
            value={geofenceName}
            onChange={(e) => setGeofenceName(e.target.value)}
            disabled={saving}
          />
        </Form.Group>

        <Form.Label className="fw-semibold small mb-2">Choose a Pet</Form.Label>
        <ListGroup style={{ maxHeight: "180px", overflowY: "auto" }}>
          {devices.map((device) => {
            const id = device.deviceId || device.device_id;
            const isSelected = selectedDeviceIds.includes(id);

            return (
              <ListGroup.Item
                key={id}
                action
                onClick={() => handleDeviceSelect(id)}
                className={`d-flex justify-content-between align-items-center rounded mb-2 py-2 px-3 ${
                  isSelected ? "bg-primary text-white" : "bg-light"
                }`}
                style={{
                  border: "1px solid #ccc",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: isSelected ? "500" : "400",
                  pointerEvents: saving ? "none" : "auto",
                }}
              >
                <div className="text-truncate" style={{ maxWidth: "85%" }}>
                  {device.petName || "Unnamed"} – <small>{id}</small>
                </div>
                {isSelected && <FaCheck />}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer className="py-2 px-3 d-flex justify-content-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={handleConfirm}
          disabled={selectedDeviceIds.length === 0 || saving}
        >
          {saving ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Saving...
            </>
          ) : (
            "Confirm"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectDeviceModal;
