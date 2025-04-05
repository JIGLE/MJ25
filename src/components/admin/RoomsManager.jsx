import React, { useState, useEffect } from 'react';
// Removed useTranslation import
import { db } from '../../firebaseConfig';
import { ref, onValue, off, set, push, remove } from 'firebase/database';
import { Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import styles from './RoomsManager.module.css';

function RoomsManager() {
  const [rooms, setRooms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Add/Edit Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState({
    id: null, name: '', description: '', price: '', capacity: '',
    singleBeds: 0, doubleBeds: 0, queenBeds: 0, kingBeds: 0,
    bathroom: 'Yes', image: '', available: true
  });

  const roomsRef = ref(db, 'rooms');

  useEffect(() => {
    setIsLoading(true);
    const listener = onValue(roomsRef, (snapshot) => {
      setRooms(snapshot.val() || {});
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching rooms:", err);
      setError('Error fetching rooms.');
      setIsLoading(false);
    });

    return () => off(roomsRef, 'value', listener);
  }, []);

  // --- Modal Handling ---
  const handleShowAddModal = () => {
    setCurrentRoom({
      id: null, name: '', description: '', price: '', capacity: '',
      singleBeds: 0, doubleBeds: 0, queenBeds: 0, kingBeds: 0,
      bathroom: 'Yes', image: '', available: true
    });
    setShowAddModal(true);
  };

  const handleShowEditModal = (roomId, roomData) => {
    setCurrentRoom({ id: roomId, ...roomData });
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setError('');
  };

  const handleRoomChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCurrentRoom(prev => ({ ...prev, [name]: newValue }));
  };

  // --- CRUD Operations ---
  const handleAddRoom = async (event) => {
    event.preventDefault();
    setError('');
    const { name, price, capacity } = currentRoom;

    if (!name.trim() || !price || !capacity) {
      setError('Name, Price, and Capacity are required.');
      return;
    }

    const newRoomData = { ...currentRoom };
    delete newRoomData.id; // Remove temporary ID

    // Convert numeric fields
    newRoomData.price = parseFloat(price);
    newRoomData.capacity = parseInt(capacity);
    newRoomData.singleBeds = parseInt(currentRoom.singleBeds || 0);
    newRoomData.doubleBeds = parseInt(currentRoom.doubleBeds || 0);
    newRoomData.queenBeds = parseInt(currentRoom.queenBeds || 0);
    newRoomData.kingBeds = parseInt(currentRoom.kingBeds || 0);

    try {
      await push(roomsRef, newRoomData);
      handleCloseModals();
    } catch (err) {
      console.error("Error adding room:", err);
      setError('Error adding room: ' + err.message);
    }
  };

  const handleEditRoom = async (event) => {
    event.preventDefault();
    setError('');
    const { id, name, price, capacity } = currentRoom;

    if (!name.trim() || !price || !capacity) {
      setError('Name, Price, and Capacity are required.');
      return;
    }
    if (!id) {
        setError('Room ID is missing, cannot update.');
        return;
    }

    const updatedRoomData = { ...currentRoom };
    delete updatedRoomData.id; // Remove ID before saving

    // Convert numeric fields
    updatedRoomData.price = parseFloat(price);
    updatedRoomData.capacity = parseInt(capacity);
    updatedRoomData.singleBeds = parseInt(currentRoom.singleBeds || 0);
    updatedRoomData.doubleBeds = parseInt(currentRoom.doubleBeds || 0);
    updatedRoomData.queenBeds = parseInt(currentRoom.queenBeds || 0);
    updatedRoomData.kingBeds = parseInt(currentRoom.kingBeds || 0);

    try {
      await set(ref(db, `rooms/${id}`), updatedRoomData);
      handleCloseModals();
    } catch (err) {
      console.error("Error updating room:", err);
      setError('Error updating room: ' + err.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await remove(ref(db, `rooms/${roomId}`));
      } catch (err) {
        console.error("Error deleting room:", err);
        setError('Error deleting room: ' + err.message);
      }
    }
  };

  // --- Render ---
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={`admin-font`}>
      <div className={`${styles.adminContainer} d-flex justify-content-between align-items-center mb-3`}>
        <h2>Manage Rooms</h2>
        <Button variant="primary" onClick={handleShowAddModal}>
          <i className="fas fa-plus"></i> Add New Room
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive className={`${styles.roomTable}`}>
        <thead className={styles.roomTableTh}>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price (€)</th>
            <th>Capacity</th>
            <th>Single Beds</th>
            <th>Double Beds</th>
            <th>Bathroom</th>
            <th>Image Link</th>
            <th>Image</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(rooms).length === 0 ? (
            <tr>
              <td colSpan="11">No rooms defined yet.</td>
            </tr>
          ) : (
            Object.entries(rooms).map(([id, roomData]) => (
              <tr key={id}>
                <td>{roomData.name}</td>
                <td>{roomData.description}</td>
                <td>{roomData.price}</td>
                <td>{roomData.capacity}</td>
                <td>{roomData.singleBeds || 0}</td>
                <td>{roomData.doubleBeds || 0}</td>
                <td>{roomData.bathroom}</td>
                <td><a href={roomData.image} target="_blank" rel="noopener noreferrer">{roomData.image}</a></td>
                <td><img src={roomData.image} alt={roomData.name || "Room Image"} style={{ height: "50px" }} /></td>
                <td>
                  {roomData.available
                    ? <Badge bg="success">Available</Badge>
                    : <Badge bg="secondary">Unavailable</Badge>}
                </td>
                <td>
                  <Button variant="warning" size="sm" className="mr-2" onClick={() => handleShowEditModal(id, roomData)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteRoom(id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showAddModal || showEditModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{showAddModal ? 'Add New Room' : 'Edit Room'}</Modal.Title>
        </Modal.Header>
        <Form className={styles.addRoomForm} onSubmit={showAddModal ? handleAddRoom : handleEditRoom}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className={styles.addRoomFormLabel}>Name</Form.Label>
              <Form.Control type="text" name="name" value={currentRoom.name} onChange={handleRoomChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.addRoomFormLabel}>Price (€)</Form.Label>
              <Form.Control type="number" name="price" value={currentRoom.price} onChange={handleRoomChange} step="0.01" required />
              <Form.Label className={styles.addRoomFormLabel}>Capacity</Form.Label>
              <Form.Control type="number" name="capacity" value={currentRoom.capacity} onChange={handleRoomChange} min="1" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" value={currentRoom.description} onChange={handleRoomChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.addRoomFormLabel}>Single Beds</Form.Label>
              <Form.Control type="number" name="singleBeds" value={currentRoom.singleBeds} onChange={handleRoomChange} min="0" />
              <Form.Label className={styles.addRoomFormLabel}>Double Beds</Form.Label>
              <Form.Control type="number" name="doubleBeds" value={currentRoom.doubleBeds} onChange={handleRoomChange} min="0" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.addRoomFormLabel}>Bathroom</Form.Label>
              <Form.Control as="select" name="bathroom" value={currentRoom.bathroom} onChange={handleRoomChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Shared">Shared</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control type="url" name="image" value={currentRoom.image} onChange={handleRoomChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" name="available" label="Available" checked={currentRoom.available} onChange={handleRoomChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModals}>Cancel</Button>
            <Button variant={showAddModal ? "primary" : "success"} type="submit">
              {showAddModal ? 'Add Room' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

export default RoomsManager;
