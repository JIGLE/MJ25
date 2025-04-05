import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, onValue, off, set, push, remove } from 'firebase/database';
import { Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import styles from './RsvpFieldsManager.module.css';

function RsvpFieldsManager() {
  const [fields, setFields] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Add/Edit Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentField, setCurrentField] = useState({ id: null, name: '', type: 'text', required: false, options: '' });
  const [showOptions, setShowOptions] = useState(false); // For conditional display in modal

  const fieldsRef = ref(db, 'config/rsvpFields');

  useEffect(() => {
    setIsLoading(true);
    const listener = onValue(fieldsRef, (snapshot) => {
      const data = snapshot.val() || {};
      // Sort fields by order before setting state
      const sortedData = Object.entries(data)
        .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      setFields(sortedData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching RSVP fields:", err);
      setError('Error fetching RSVP fields.');
      setIsLoading(false);
    });

    return () => off(fieldsRef, 'value', listener);
  }, []);

  // --- Modal Handling ---
  const handleShowAddModal = () => {
    setCurrentField({ id: null, name: '', type: 'text', required: false, options: '' });
    setShowOptions(false);
    setShowAddModal(true);
  };

  const handleShowEditModal = (fieldId, fieldData) => {
    setCurrentField({
      id: fieldId,
      name: fieldData.name || '',
      type: fieldData.type || 'text',
      required: fieldData.required || false,
      options: fieldData.options ? fieldData.options.join(', ') : '' // Join options array for input
    });
    setShowOptions(fieldData.type === 'select' || fieldData.type === 'radio');
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setError(''); // Clear modal-specific errors
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCurrentField(prev => ({ ...prev, [name]: newValue }));

    // Show/hide options based on type selection in modal
    if (name === 'type') {
      setShowOptions(value === 'select' || value === 'radio');
    }
  };

  // --- CRUD Operations ---
  const handleAddField = async (event) => {
    event.preventDefault();
    setError('');
    const { name, type, required } = currentField;
    let optionsArray = null;

    if (!name.trim()) {
      setError('Field Name is required.');
      return;
    }

    // Sanitize name to be a valid Firebase key (basic example)
    const fieldKey = name.trim().replace(/[.#$[\]]/g, '_');

    if (showOptions) {
      optionsArray = currentField.options.split(',').map(opt => opt.trim()).filter(opt => opt);
      if (!optionsArray.length) {
        setError('Options are required for select/radio types.'); // Static text
        return;
      }
    }

    const newFieldData = {
      name: name.trim(),
      type: type,
      required: required,
      order: Date.now(), // Simple ordering
      ...(optionsArray && { options: optionsArray }) // Add options only if they exist
    };

    try {
      // Use set with the generated key
      await set(ref(db, `config/rsvpFields/${fieldKey}`), newFieldData);
      handleCloseModals();
    } catch (err) {
      console.error("Error adding field:", err);
      setError('Error adding field: ' + err.message);
    }
  };

  const handleEditField = async (event) => {
    event.preventDefault();
    setError('');
    const { id, name, type, required } = currentField;
    let optionsArray = null;

    if (!name.trim()) {
      setError('Field Name is required.');
      return;
    }
    if (!id) {
        setError('Field ID is missing, cannot update.'); // Static text
        return;
    }

    if (showOptions) {
      optionsArray = currentField.options.split(',').map(opt => opt.trim()).filter(opt => opt);
      if (!optionsArray.length) {
        setError('Options are required for select/radio types.'); // Static text
        return;
      }
    }

    // Fetch existing order to preserve it
    const existingFieldSnapshot = await get(ref(db, `config/rsvpFields/${id}`));
    const existingOrder = existingFieldSnapshot.val()?.order || Date.now();

    const updatedFieldData = {
      name: name.trim(),
      type: type,
      required: required,
      order: existingOrder, // Preserve original order
      ...(optionsArray && { options: optionsArray })
    };
     // Explicitly remove options if type is not select/radio
    if (!optionsArray) {
        updatedFieldData.options = null;
    }


    try {
      await set(ref(db, `config/rsvpFields/${id}`), updatedFieldData); // Use set to overwrite
      handleCloseModals();
    } catch (err) {
      console.error("Error updating field:", err);
      setError('Error updating field: ' + err.message);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await remove(ref(db, `config/rsvpFields/${fieldId}`));
      } catch (err) {
        console.error("Error deleting field:", err);
        setError('Error deleting field: ' + err.message);
      }
    }
  };

  // --- Render ---
  if (isLoading) {
    return <p>Loading...</p>; // Static text
  }

  return (
    <div className={`admin-font ${styles.container}`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className={styles.heading}>Manage RSVP Form Fields</h2>
        <Button onClick={handleShowAddModal}>
          <i className="fas fa-plus"></i> Add New Field
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table className="table">
        <thead>
          <tr>
            <th>Field Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Options</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(fields).length === 0 ? (
            <tr>
              <td colSpan="5">No RSVP fields defined yet.</td>
            </tr>
          ) : (
            Object.entries(fields).map(([id, fieldData]) => (
              <tr key={id}>
                <td>{fieldData.name}</td>
                <td>{fieldData.type}</td>
                <td>{fieldData.required ? 'Yes' : 'No'}</td>
                <td>{(fieldData.type === 'select' || fieldData.type === 'radio') && fieldData.options ? fieldData.options.join(', ') : '-'}</td>
                <td>
                  <Button size="sm" onClick={() => handleShowEditModal(id, fieldData)}>
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => handleDeleteField(id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Add Field Modal */}
      <Modal show={showAddModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Field</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddField}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="formFieldName">
              <Form.Label>Field Name (e.g., dietary_restrictions)</Form.Label>
              <Form.Control type="text" name="name" value={currentField.name} onChange={handleFieldChange} required />
            </Form.Group>
            <Form.Group controlId="formFieldType">
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" name="type" value={currentField.type} onChange={handleFieldChange}>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="radio">Radio Buttons</option>
                <option value="checkbox">Checkbox (Single)</option>
                <option value="textarea">Text Area</option>
              </Form.Control>
            </Form.Group>
            {showOptions && (
              <Form.Group controlId="formFieldOptions">
                <Form.Label>Options (comma-separated for select/radio)</Form.Label>
                <Form.Control type="text" name="options" value={currentField.options} onChange={handleFieldChange} />
              </Form.Group>
            )}
            <Form.Group controlId="formFieldRequired">
              <Form.Check type="checkbox" name="required" label="Required" checked={currentField.required} onChange={handleFieldChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleCloseModals}>Cancel</Button>
            <Button type="submit">Add Field</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Field Modal */}
      <Modal show={showEditModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Field</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditField}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="editFormFieldName">
              <Form.Label>Field Name</Form.Label>
              <Form.Control type="text" name="name" value={currentField.name} onChange={handleFieldChange} required />
            </Form.Group>
            <Form.Group controlId="editFormFieldType">
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" name="type" value={currentField.type} onChange={handleFieldChange}>
                 <option value="text">Text</option>
                 <option value="email">Email</option>
                 <option value="tel">Phone</option>
              </Form.Control>
            </Form.Group>
            {showOptions && (
              <Form.Group controlId="editFormFieldOptions">
                <Form.Label>Options (comma-separated)</Form.Label>
                <Form.Control type="text" name="options" value={currentField.options} onChange={handleFieldChange} />
              </Form.Group>
            )}
            <Form.Group controlId="editFormFieldRequired">
              <Form.Check type="checkbox" name="required" label="Required" checked={currentField.required} onChange={handleFieldChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleCloseModals}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

export default RsvpFieldsManager;
