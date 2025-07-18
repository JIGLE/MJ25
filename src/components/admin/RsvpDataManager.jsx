import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, onValue, off, push, set } from 'firebase/database';
import { Table, Alert, Button, Modal, Form } from 'react-bootstrap';
import styles from './RsvpDataManager.module.css';

function RsvpDataManager() {
  const [rsvps, setRsvps] = useState({});
  const [fieldsConfig, setFieldsConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRsvpId, setEditingRsvpId] = useState(null);
  const [newRsvpData, setNewRsvpData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const rsvpsRef = ref(db, 'rsvps');
  const fieldsRef = ref(db, 'config/rsvpFields');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRsvpData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async () => {
    if (editingRsvpId) {
      // Update existing RSVP
      await set(ref(db, `rsvps/${editingRsvpId}`), newRsvpData);
    } else {
      // Create new RSVP
      await push(rsvpsRef, newRsvpData);
    }
    setNewRsvpData({}); // Clear the form
    setEditingRsvpId(null); // Clear editing ID
    handleCloseModal();
  };

  const handleEdit = (rsvpId, rsvpData) => {
    setEditingRsvpId(rsvpId);
    setNewRsvpData(rsvpData);
    setShowAddModal(true); // Open the modal in edit mode
  };

  const handleDelete = async (rsvpId) => {
    if (window.confirm("Are you sure you want to delete this RSVP?")) {
      const rsvpRef = ref(db, `rsvps/${rsvpId}`);
      await set(rsvpRef, null); // Delete by setting to null
    }
  };

  const handleShowAddModal = () => {
    setNewRsvpData({});
    setEditingRsvpId(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setError('');
  };

  useEffect(() => {
    setIsLoading(true);
    let fieldsListener, rsvpsListener;

    // Fetch fields config first
    fieldsListener = onValue(fieldsRef, (snapshot) => {
      const configData = snapshot.val() || {};
      // Sort fields by order for consistent column display
      const sortedConfig = Object.entries(configData)
        .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      setFieldsConfig(sortedConfig);

      // Once config is fetched, fetch RSVP data
      rsvpsListener = onValue(rsvpsRef, (snapshot) => {
        setRsvps(snapshot.val() || {});
        setIsLoading(false);
      }, (err) => {
        console.error("Error fetching RSVP data:", err);
        setError('Error fetching RSVP data.');
        setIsLoading(false);
      });

    }, (err) => {
      console.error("Error fetching fields config:", err);
      setError('Error fetching RSVP fields configuration.');
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      if (fieldsListener) off(fieldsRef, 'value', fieldsListener);
      if (rsvpsListener) off(rsvpsRef, 'value', rsvpsListener);
    };
  }, []);

  if (isLoading) {
    return <p>Loading RSVP data...</p>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const fieldKeys = Object.keys(fieldsConfig);
  const rsvpEntries = Object.entries(rsvps);

  return (
    <div className="admin-font">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>RSVP Data</h2>
        <Button variant="primary" onClick={handleShowAddModal}>
          <i className="fas fa-plus"></i> Add New RSVP
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive className={styles.rsvpTable}>
        <thead>
          <tr>
            <th>Group</th>
            {fieldKeys.map(key => (
              <th key={key}>{fieldsConfig[key]?.name || key}</th>
            ))}
            <th>Selected Room</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rsvpEntries.length === 0 ? (
            <tr>
              <td colSpan={fieldKeys.length + 3}>No RSVP data yet.</td>
            </tr>
          ) : (
            rsvpEntries.map(([rsvpId, rsvpData]) => (
              <tr key={rsvpId}>
                <td>{rsvpData.group || '-'}</td>
                {fieldKeys.map(key => (
                  <td key={key}>
                    {typeof rsvpData[key] === 'boolean'
                      ? rsvpData[key]
                        ? 'Yes'
                        : 'No'
                      : rsvpData[key] || '-'}
                  </td>
                ))}
                <td>{rsvpData.selected_room || '-'}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEdit(rsvpId, {...rsvpData})}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(rsvpId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Add/Edit RSVP Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRsvpId ? 'Edit RSVP' : 'Add New RSVP'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            {fieldKeys.map(key => (
              <Form.Group key={key} className="mb-3">
                <Form.Label>{fieldsConfig[key]?.name || key}</Form.Label>
                <Form.Control
                  type={fieldsConfig[key]?.type || 'text'}
                  name={key}
                  value={newRsvpData[key] || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} size="sm">Cancel</Button>
          <Button variant="primary" onClick={handleCreate} size="sm">
            {editingRsvpId ? 'Update RSVP' : 'Add RSVP'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RsvpDataManager;
