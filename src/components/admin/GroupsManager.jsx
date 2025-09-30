import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, onValue, off, push, remove, set } from 'firebase/database';
import { Button, Table, Modal, Form, Alert } from 'react-bootstrap';

function GroupsManager() {
  const [groups, setGroups] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkAddGroupsText, setBulkAddGroupsText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupGuestCount, setEditGroupGuestCount] = useState(1);

  const groupsRef = ref(db, 'groups');

  useEffect(() => {
    setIsLoading(true);
    const listener = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const groupsArray = Object.entries(data).map(([id, groupData]) => ({
        id: id,
        name: groupData.name,
        guestCount: groupData.guestCount || 1, // Default to 1 if guestCount is not defined
      }));
      setGroups(Object.fromEntries(groupsArray.map(group => [group.id, group])));
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching groups:", err);
      setError('Error fetching groups.');
      setIsLoading(false);
    });

    return () => off(groupsRef, 'value', listener);
  }, []);

  // --- Modal Handling ---
  const handleShowAddModal = () => {
    setNewGroupName('');
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setError('');
  };

  const handleShowEditModal = (id, name, guestCount) => {
    setEditGroupId(id);
    setEditGroupName(name);
    setEditGroupGuestCount(guestCount);
    setShowEditModal(true);
  };

  // --- CRUD Operations ---
  const handleAddGroup = async (event) => {
    event.preventDefault();
    setError('');
    const name = newGroupName.trim();

    if (!name) {
      setError('Please provide a valid group name.');
      return;
    }

    try {
      await push(groupsRef, { name: name });
      handleCloseModal();
    } catch (err) {
      console.error("Error adding group:", err);
      setError('Error adding group: ' + err.message);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await remove(ref(db, `groups/${groupId}`));
      } catch (err) {
        console.error("Error deleting group:", err);
        setError('Error deleting group: ' + err.message);
      }
    }
  };

  // addGroupToDatabase removed — use handleAddGroup or handleBulkAddGroups instead

    const handleBulkAddGroups = async (event) => {
    event.preventDefault();
    setError('');

    const lines = bulkAddGroupsText.split('\n');
    for (const line of lines) {
      const [name, guestCount] = line.split(',').map(item => item.trim());
      if (name) {
        try {
          await push(groupsRef, { name: name, guestCount: parseInt(guestCount) || 1 });
          console.log(`Added group: ${name} with guest count: ${guestCount}`);
        } catch (err) {
          console.error(`Error adding group ${name}:`, err);
          setError(`Error adding group ${name}: ${err.message}`);
        }
      }
    }
    setShowBulkAddModal(false);
  };

  // --- Render ---
  if (isLoading) {
    return <p>Loading groups...</p>;
  }

  return (
    <div className="admin-font">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Groups</h2>
        <Button variant="primary" onClick={handleShowAddModal}>
          <i className="fas fa-plus"></i> Add New Group
        </Button>{' '}
        <Button variant="info" onClick={() => setShowBulkAddModal(true)}>
          <i className="fas fa-plus"></i> Bulk Add Groups
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Guest Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groups).length === 0 ? (
            <tr>
              <td colSpan="2">No groups defined yet.</td>
            </tr>
          ) : (
            Object.entries(groups).map(([id, groupData]) => (
              <tr key={id}>
                <td>{groupData.name}</td>
                <td>{groupData.guestCount}</td>
                <td>
                  <Button variant="primary" size="sm" onClick={() => handleShowEditModal(id, groupData.name, groupData.guestCount)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDeleteGroup(id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Add Group Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Group</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddGroup}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="formGroupName"> {/* Removed row class */}
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">Add Group</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Bulk Add Group Modal */}
      <Modal show={showBulkAddModal} onHide={() => setShowBulkAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Add Groups</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBulkAddGroups}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="formBulkAddGroups">
              <Form.Label>Enter groups (one per line, format: Group Name,Guest Count)</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={bulkAddGroupsText}
                onChange={(e) => setBulkAddGroupsText(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBulkAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Groups</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Group</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditGroup}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="formGroupName">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formGroupGuestCount">
              <Form.Label>Guest Count</Form.Label>
              <Form.Control
                type="number"
                value={editGroupGuestCount}
                onChange={(e) => setEditGroupGuestCount(e.target.value)}
                min="1"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );

  async function handleEditGroup(event) {
    event.preventDefault();
    setError('');
    const name = editGroupName.trim();
    const guestCount = parseInt(editGroupGuestCount);

    if (!name) {
      setError('Please provide a valid group name.');
      return;
    }

    if (isNaN(guestCount) || guestCount <= 0) {
      setError('Please provide a valid guest count (at least 1).');
      return;
    }

    try {
      await set(ref(db, `groups/${editGroupId}`), { name: name, guestCount: guestCount });
      setShowEditModal(false);
    } catch (err) {
      console.error("Error editing group:", err);
      setError('Error editing group: ' + err.message);
    }
  }
}

export default GroupsManager;
