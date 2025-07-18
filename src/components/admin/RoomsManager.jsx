import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebaseConfig';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Modal, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { 
  BsPlus, 
  BsPeople, 
  BsCurrencyDollar, 
  BsCalendar, 
  BsImage,
  BsTrash,
  BsPencil,
  BsSearch,
  BsChevronRight
} from 'react-icons/bs';
import styles from './RoomsManager.module.css';

function RoomsManager() {
  const [rooms, setRooms] = useState({});
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const defaultRoomData = {
    name: '',
    type: 'standard',
    capacity: 2,
    description: '',
    imageUrl: '',
    price: 0,
    amenities: [],
    status: 'available',
    guestInfo: null,
    payments: null,
    notes: ''
  };

  const [formData, setFormData] = useState(defaultRoomData);

  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        setRooms(snapshot.val());
      } else {
        setRooms({});
      }
    }, (error) => {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    });

    return () => unsubscribe();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const roomsRef = ref(db, 'rooms');
      const newRoomRef = push(roomsRef);
      await set(newRoomRef, formData);
      setShowAddModal(false);
      setFormData(defaultRoomData);
    } catch (error) {
      console.error('Error adding room:', error);
      setError('Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      await remove(roomRef);
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('Failed to delete room');
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      const imageRef = storageRef(storage, `rooms/${file.name}-${Date.now()}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      setFormData(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  const filteredRooms = Object.entries(rooms)
    .filter(([_, room]) => {
      if (filter === 'all') return true;
      return (room?.status || 'available') === filter;
    })
    .filter(([_, room]) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return room?.name?.toLowerCase().includes(searchLower);
    });

  const selectedRoom = selectedRoomId ? rooms[selectedRoomId] : null;

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.searchRow}>
            <InputGroup size="sm" className={styles.searchBox}>
              <InputGroup.Text><BsSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Form.Select 
              size="sm"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Rooms</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="pending">Pending</option>
            </Form.Select>
          </div>

          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowAddModal(true)}
            className={styles.addButton}
          >
            <BsPlus size={16} /> ADD ROOM
          </Button>
        </div>

        <div className={styles.roomsList}>
          {filteredRooms.map(([id, room]) => (
            <div 
              key={id} 
              className={`${styles.roomListItem} ${selectedRoomId === id ? styles.selected : ''}`}
              onClick={() => setSelectedRoomId(id)}
            >
              <div className={styles.roomListImage}>
                {room?.imageUrl ? (
                  <img src={room.imageUrl} alt={room.name} />
                ) : (
                  <BsImage />
                )}
              </div>
              <div className={styles.roomListInfo}>
                <h3>{room?.name || 'Unnamed Room'}</h3>
                <div className={styles.roomMeta}>
                  <span className={styles.roomType}>{room?.type || 'standard'}</span>
                  <span className={styles.roomStatus}>{room?.status || 'available'}</span>
                </div>
              </div>
              <BsChevronRight className={styles.chevron} size={14} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mainContent}>
        {selectedRoom ? (
          <div className={styles.roomDetail}>
            <div className={styles.roomDetailHeader}>
              <h2>{selectedRoom.name}</h2>
              <div className={styles.roomActions}>
                <Button 
                  variant="warning"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                >
                  EDIT
                </Button>
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(selectedRoomId)}
                >
                  DELETE
                </Button>
              </div>
            </div>

            <div className={styles.roomDetailContent}>
              <div className={styles.imageSection}>
                {selectedRoom.imageUrl ? (
                  <img src={selectedRoom.imageUrl} alt={selectedRoom.name} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <BsImage size={32} />
                  </div>
                )}
              </div>

              <div className={styles.roomInfo}>
                <h3>Room Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={styles.infoValue}>{selectedRoom.type}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Capacity</span>
                    <span className={styles.infoValue}>{selectedRoom.capacity} guests</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Price</span>
                    <span className={styles.infoValue}>${selectedRoom.price}/night</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Status</span>
                    <span className={styles.infoValue}>{selectedRoom.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noSelection}>
            <BsImage size={32} />
            <p>Select a room to view details</p>
          </div>
        )}
      </div>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddRoom}>
            <Form.Group className="mb-3">
              <Form.Label>Room Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="standard">Standard</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                min="1"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price per Night</Form.Label>
              <Form.Control
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Room'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RoomsManager;
