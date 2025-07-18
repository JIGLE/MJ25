import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { Modal, Form, Button, Alert, Table, Row, Col, Card, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import { 
  BsPlus, 
  BsPeople, 
  BsHouseDoor, 
  BsCalendar, 
  BsSearch,
  BsPencil,
  BsTrash,
  BsPersonPlus,
  BsPersonCheck,
  BsArrowRight,
  BsArrowLeft,
  BsCheck,
  BsX,
  BsPersonFill,
  BsEyeFill
} from 'react-icons/bs';
import styles from './RoomBookingManager.module.css';

function RoomBookingManager() {
  const [rooms, setRooms] = useState({});
  const [rsvps, setRsvps] = useState({});
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'assign', 'manage'
  
  // Form State
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    guestId: '',
    companionGuestId: '',
    checkInDate: '',
    checkOutDate: '',
    notes: '',
    status: 'confirmed'
  });

  // Load data from Firebase
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const rsvpsRef = ref(db, 'rsvps');
    const bookingsRef = ref(db, 'bookings');

    const roomsUnsubscribe = onValue(roomsRef, (snapshot) => {
      setRooms(snapshot.val() || {});
    });

    const rsvpsUnsubscribe = onValue(rsvpsRef, (snapshot) => {
      setRsvps(snapshot.val() || {});
    });

    const bookingsUnsubscribe = onValue(bookingsRef, (snapshot) => {
      setBookings(snapshot.val() || {});
    });

    return () => {
      roomsUnsubscribe();
      rsvpsUnsubscribe();
      bookingsUnsubscribe();
    };
  }, []);

  // Get available guests (those not already assigned to rooms)
  const getAvailableGuests = () => {
    const assignedGuestIds = new Set();
    Object.values(bookings).forEach(booking => {
      if (booking.guestId) assignedGuestIds.add(booking.guestId);
      if (booking.companionGuestId) assignedGuestIds.add(booking.companionGuestId);
    });

    return Object.entries(rsvps).filter(([id, guest]) => 
      !assignedGuestIds.has(id) && guest.attending === true
    );
  };

  // Get booking for a specific room
  const getRoomBooking = (roomId) => {
    return Object.entries(bookings).find(([_, booking]) => booking.roomId === roomId);
  };

  // Handle room assignment
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingsRef = ref(db, 'bookings');
      const newBookingRef = push(bookingsRef);
      
      const bookingData = {
        ...bookingForm,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await set(newBookingRef, bookingData);
      
      // Update room status
      const roomRef = ref(db, `rooms/${bookingForm.roomId}`);
      await set(roomRef, {
        ...rooms[bookingForm.roomId],
        status: 'occupied'
      });

      setShowBookingModal(false);
      setBookingForm({
        roomId: '',
        guestId: '',
        companionGuestId: '',
        checkInDate: '',
        checkOutDate: '',
        notes: '',
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId, roomId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setLoading(true);
      
      // Remove booking
      const bookingRef = ref(db, `bookings/${bookingId}`);
      await remove(bookingRef);
      
      // Update room status back to available
      const roomRef = ref(db, `rooms/${roomId}`);
      await set(roomRef, {
        ...rooms[roomId],
        status: 'available'
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms based on search
  const filteredRooms = Object.entries(rooms).filter(([_, room]) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return room?.name?.toLowerCase().includes(searchLower);
  });

  const availableGuests = getAvailableGuests();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Room Booking Management</h2>
          <div className={styles.viewToggle}>
            <Button 
              variant={viewMode === 'overview' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              <BsEyeFill /> Overview
            </Button>
            <Button 
              variant={viewMode === 'assign' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('assign')}
            >
              <BsPersonPlus /> Assign Guests
            </Button>
            <Button 
              variant={viewMode === 'manage' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('manage')}
            >
              <BsPencil /> Manage Bookings
            </Button>
          </div>
        </div>
        <div className={styles.headerRight}>
          <InputGroup size="sm" className={styles.searchBox}>
            <InputGroup.Text><BsSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button 
            variant="success" 
            size="sm"
            onClick={() => setShowBookingModal(true)}
          >
            <BsPlus /> New Booking
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className={styles.alert}>{error}</Alert>}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {viewMode === 'overview' && (
          <Row className={styles.roomsGrid}>
            {filteredRooms.map(([roomId, room]) => {
              const [bookingId, booking] = getRoomBooking(roomId) || [null, null];
              const guest = booking?.guestId ? rsvps[booking.guestId] : null;
              const companion = booking?.companionGuestId ? rsvps[booking.companionGuestId] : null;

              return (
                <Col key={roomId} xl={3} lg={4} md={6} className="mb-3">
                  <Card className={`${styles.roomCard} ${booking ? styles.occupied : styles.available}`}>
                    <Card.Header className={styles.roomCardHeader}>
                      <div className={styles.roomTitle}>
                        <BsHouseDoor /> {room.name}
                      </div>
                      <Badge bg={booking ? 'danger' : 'success'} className="small">
                        {booking ? 'Occupied' : 'Available'}
                      </Badge>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <div className={styles.roomInfo}>
                        <p><strong>Type:</strong> {room.type}</p>
                        <p><strong>Capacity:</strong> {room.capacity} guests</p>
                        {room.price && <p><strong>Price:</strong> ${room.price}/night</p>}
                      </div>
                      
                      {booking && (
                        <div className={styles.guestInfo}>
                          <h6><BsPeople /> Guests</h6>
                          {guest && (
                            <div className={styles.guestDetail}>
                              <BsPersonFill /> {guest.firstName} {guest.lastName}
                              {guest.email && <small className="d-block text-muted">{guest.email}</small>}
                            </div>
                          )}
                          {companion && (
                            <div className={styles.guestDetail}>
                              <BsPersonFill /> {companion.firstName} {companion.lastName}
                              <small className="d-block text-muted">Companion</small>
                            </div>
                          )}
                          {booking.notes && (
                            <div className={styles.notes}>
                              <strong>Notes:</strong> {booking.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </Card.Body>
                    {booking && (
                      <Card.Footer className="p-2">
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleCancelBooking(bookingId, roomId)}
                          disabled={loading}
                          className="w-100"
                        >
                          <BsTrash /> Cancel
                        </Button>
                      </Card.Footer>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {viewMode === 'assign' && (
          <Row>
            <Col lg={6}>
              <Card className="h-100">
                <Card.Header className="py-2">
                  <h6 className="mb-0"><BsHouseDoor /> Available Rooms</h6>
                </Card.Header>
                <Card.Body className={styles.scrollableList}>
                  {filteredRooms
                    .filter(([roomId]) => !getRoomBooking(roomId))
                    .map(([roomId, room]) => (
                      <div 
                        key={roomId} 
                        className={`${styles.listItem} ${selectedRoomId === roomId ? styles.selected : ''}`}
                        onClick={() => setSelectedRoomId(roomId)}
                      >
                        <div className={styles.itemInfo}>
                          <strong>{room.name}</strong>
                          <small className="d-block">{room.type} • {room.capacity} guests</small>
                        </div>
                        <BsArrowRight />
                      </div>
                    ))}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="h-100">
                <Card.Header className="py-2">
                  <h6 className="mb-0"><BsPeople /> Available Guests ({availableGuests.length})</h6>
                </Card.Header>
                <Card.Body className={styles.scrollableList}>
                  {availableGuests.map(([guestId, guest]) => (
                    <div 
                      key={guestId} 
                      className={styles.listItem}
                      onClick={() => {
                        if (selectedRoomId) {
                          setBookingForm({
                            ...bookingForm,
                            roomId: selectedRoomId,
                            guestId: guestId
                          });
                          setShowBookingModal(true);
                        }
                      }}
                    >
                      <div className={styles.itemInfo}>
                        <strong>{guest.firstName} {guest.lastName}</strong>
                        {guest.email && <small className="d-block">{guest.email}</small>}
                        {guest.companionName && (
                          <small className="d-block text-primary">+ {guest.companionName}</small>
                        )}
                      </div>
                      {selectedRoomId && <BsArrowLeft />}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {viewMode === 'manage' && (
          <Card>
            <Card.Header className="py-2">
              <h6 className="mb-0"><BsPencil /> Current Bookings</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Primary Guest</th>
                    <th>Companion</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bookings).map(([bookingId, booking]) => {
                    const room = rooms[booking.roomId];
                    const guest = rsvps[booking.guestId];
                    const companion = booking.companionGuestId ? rsvps[booking.companionGuestId] : null;

                    return (
                      <tr key={bookingId}>
                        <td>{room?.name || 'Unknown Room'}</td>
                        <td>
                          {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                          {guest?.email && <small className="d-block text-muted">{guest.email}</small>}
                        </td>
                        <td>
                          {companion ? `${companion.firstName} ${companion.lastName}` : '-'}
                        </td>
                        <td>{booking.checkInDate || '-'}</td>
                        <td>{booking.checkOutDate || '-'}</td>
                        <td>
                          <Badge bg={booking.status === 'confirmed' ? 'success' : 'warning'} className="small">
                            {booking.status}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelBooking(bookingId, booking.roomId)}
                            disabled={loading}
                          >
                            <BsTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateBooking}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room</Form.Label>
                  <Form.Select
                    value={bookingForm.roomId}
                    onChange={(e) => setBookingForm({...bookingForm, roomId: e.target.value})}
                    required
                  >
                    <option value="">Select a room...</option>
                    {filteredRooms
                      .filter(([roomId]) => !getRoomBooking(roomId))
                      .map(([roomId, room]) => (
                        <option key={roomId} value={roomId}>
                          {room.name} ({room.type}, {room.capacity} guests)
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Primary Guest</Form.Label>
                  <Form.Select
                    value={bookingForm.guestId}
                    onChange={(e) => setBookingForm({...bookingForm, guestId: e.target.value})}
                    required
                  >
                    <option value="">Select primary guest...</option>
                    {availableGuests.map(([guestId, guest]) => (
                      <option key={guestId} value={guestId}>
                        {guest.firstName} {guest.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Companion Guest (Optional)</Form.Label>
                  <Form.Select
                    value={bookingForm.companionGuestId}
                    onChange={(e) => setBookingForm({...bookingForm, companionGuestId: e.target.value})}
                  >
                    <option value="">No companion</option>
                    {availableGuests
                      .filter(([guestId]) => guestId !== bookingForm.guestId)
                      .map(([guestId, guest]) => (
                        <option key={guestId} value={guestId}>
                          {guest.firstName} {guest.lastName}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-in Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={bookingForm.checkInDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Check-out Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={bookingForm.checkOutDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm({...bookingForm, status: e.target.value})}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Special requests, dietary requirements, etc..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RoomBookingManager;
