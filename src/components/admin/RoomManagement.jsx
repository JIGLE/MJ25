import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, set, push, remove, onValue } from 'firebase/database';
import {
  BsHouseFill,
  BsPeople,
  BsPersonFill,
  BsPersonCheckFill,
  BsPersonXFill,
  BsPlus,
  BsSearch,
  BsPencil,
  BsTrash,
  BsEyeFill,
  BsDownload,
  BsUpload,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsCreditCard,
  BsCalendarEventFill,
  BsClock,
  BsGeoAltFill,
  BsHouse,
  BsWifi
} from 'react-icons/bs';
import styles from './RoomManagement.module.css';

function RoomManagement({ data = {} }) {
  const { rooms = {}, bookings = {}, guests = {} } = data;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, occupied, pending
  const [viewMode, setViewMode] = useState('cards'); // cards, table
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Room Form
  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'standard', // standard, deluxe, suite, villa
    capacity: 2,
    price: 0,
    description: '',
    amenities: [],
    floor: 1,
    roomNumber: '',
    view: '', // ocean, garden, city, pool
    status: 'available' // available, occupied, maintenance, reserved
  });

  // Booking Form
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    guestId: '',
    companionGuestId: '',
    checkInDate: '',
    checkOutDate: '',
    status: 'confirmed', // confirmed, pending, cancelled
    paymentStatus: 'pending', // pending, paid, partial
    totalAmount: 0,
    notes: '',
    specialRequests: ''
  });

  const amenitiesList = [
    'WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Balcony', 
    'Jacuzzi', 'Room Service', 'Safe', 'Hair Dryer', 'Coffee Machine',
    'TV', 'Refrigerator', 'Bath Tub', 'Shower', 'Terrace'
  ];

  // Load rooms and bookings from Firebase
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const bookingsRef = ref(db, 'bookings');

    const roomsUnsubscribe = onValue(roomsRef, (snapshot) => {
      // This will be handled by parent component
    });

    const bookingsUnsubscribe = onValue(bookingsRef, (snapshot) => {
      // This will be handled by parent component
    });

    return () => {
      roomsUnsubscribe();
      bookingsUnsubscribe();
    };
  }, []);

  // Reset room form
  const resetRoomForm = () => {
    setRoomForm({
      name: '',
      type: 'standard',
      capacity: 2,
      price: 0,
      description: '',
      amenities: [],
      floor: 1,
      roomNumber: '',
      view: '',
      status: 'available'
    });
    setEditingRoom(null);
  };

  // Handle room creation/update
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const roomData = {
        ...roomForm,
        updatedAt: Date.now(),
        ...(editingRoom ? {} : { createdAt: Date.now() })
      };

      if (editingRoom) {
        const roomRef = ref(db, `rooms/${editingRoom}`);
        await set(roomRef, { ...rooms[editingRoom], ...roomData });
      } else {
        const roomsRef = ref(db, 'rooms');
        const newRoomRef = push(roomsRef);
        await set(newRoomRef, roomData);
      }

      setShowRoomModal(false);
      resetRoomForm();
    } catch (error) {
      console.error('Error saving room:', error);
      setError('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      setLoading(true);
      const roomRef = ref(db, `rooms/${roomId}`);
      await remove(roomRef);
      
      // Also remove any bookings for this room
      const roomBookings = Object.entries(bookings).filter(([_, booking]) => booking.roomId === roomId);
      const deletePromises = roomBookings.map(([bookingId]) => {
        const bookingRef = ref(db, `bookings/${bookingId}`);
        return remove(bookingRef);
      });
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking creation
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        ...bookingForm,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const bookingsRef = ref(db, 'bookings');
      const newBookingRef = push(bookingsRef);
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
        status: 'confirmed',
        paymentStatus: 'pending',
        totalAmount: 0,
        notes: '',
        specialRequests: ''
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Edit room
  const handleEditRoom = (roomId) => {
    const room = rooms[roomId];
    setRoomForm({ ...room });
    setEditingRoom(roomId);
    setShowRoomModal(true);
  };

  // Get room booking
  const getRoomBooking = (roomId) => {
    return Object.entries(bookings).find(([_, booking]) => booking.roomId === roomId);
  };

  // Get available guests
  const getAvailableGuests = () => {
    const assignedGuestIds = new Set();
    Object.values(bookings).forEach(booking => {
      if (booking.guestId) assignedGuestIds.add(booking.guestId);
      if (booking.companionGuestId) assignedGuestIds.add(booking.companionGuestId);
    });

    return Object.entries(guests).filter(([id, guest]) => 
      !assignedGuestIds.has(id) && guest.attending === true
    );
  };

  // Filter rooms
  const filteredRooms = Object.entries(rooms).filter(([roomId, room]) => {
    const matchesSearch = !searchTerm || 
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const booking = getRoomBooking(roomId);
    const roomStatus = booking ? 'occupied' : room.status || 'available';
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'available' && roomStatus === 'available') ||
      (filterStatus === 'occupied' && roomStatus === 'occupied') ||
      (filterStatus === 'pending' && booking && booking.status === 'pending');

    return matchesSearch && matchesFilter;
  });

  // Statistics
  const stats = {
    total: Object.keys(rooms).length,
    available: Object.entries(rooms).filter(([roomId]) => !getRoomBooking(roomId) && rooms[roomId].status === 'available').length,
    occupied: Object.values(bookings).filter(b => b.status === 'confirmed').length,
    pending: Object.values(bookings).filter(b => b.status === 'pending').length,
    revenue: Object.values(bookings).reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
    occupancyRate: Object.keys(rooms).length > 0 ? 
      Math.round((Object.values(bookings).filter(b => b.status === 'confirmed').length / Object.keys(rooms).length) * 100) : 0
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Room Management</h1>
          <p className={styles.subtitle}>Manage accommodations for your special day</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton}>
            <BsUpload /> Import Rooms
          </button>
          <button className={styles.actionButton}>
            <BsDownload /> Export Report
          </button>
          <button 
            className={styles.primaryButton}
            onClick={() => setShowRoomModal(true)}
          >
            <BsPlus /> Add Room
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.sage}`}>
          <div className={styles.statIcon}><BsHouseFill /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total Rooms</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.blush}`}>
          <div className={styles.statIcon}><BsCheckCircleFill /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.available}</div>
            <div className={styles.statLabel}>Available</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cream}`}>
          <div className={styles.statIcon}><BsPeople /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.occupied}</div>
            <div className={styles.statLabel}>Occupied</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.neutral}`}>
          <div className={styles.statIcon}><BsCreditCard /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>${stats.revenue.toLocaleString()}</div>
            <div className={styles.statLabel}>Revenue</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchContainer}>
          <BsSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Rooms</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="pending">Pending</option>
          </select>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'cards' ? styles.active : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <BsEyeFill /> Cards
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              <BsPeople /> Table
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <BsExclamationTriangleFill />
          {error}
        </div>
      )}

      {/* Room List */}
      {viewMode === 'cards' ? (
        <div className={styles.roomGrid}>
          {filteredRooms.map(([roomId, room]) => {
            const [bookingId, booking] = getRoomBooking(roomId) || [null, null];
            const guest = booking?.guestId ? guests[booking.guestId] : null;
            const companion = booking?.companionGuestId ? guests[booking.companionGuestId] : null;
            const roomStatus = booking ? 'occupied' : room.status || 'available';

            return (
              <div key={roomId} className={`${styles.roomCard} ${styles[roomStatus]}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.roomInfo}>
                    <h3 className={styles.roomName}>{room.name}</h3>
                    <p className={styles.roomNumber}>#{room.roomNumber}</p>
                  </div>
                  <div className={styles.statusBadge}>
                    {roomStatus === 'available' && (
                      <span className={`${styles.badge} ${styles.available}`}>
                        <BsCheckCircleFill /> Available
                      </span>
                    )}
                    {roomStatus === 'occupied' && (
                      <span className={`${styles.badge} ${styles.occupied}`}>
                        <BsPeople /> Occupied
                      </span>
                    )}
                    {booking?.status === 'pending' && (
                      <span className={`${styles.badge} ${styles.pending}`}>
                        <BsClock /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.roomDetails}>
                    <div className={styles.detailItem}>
                      <BsHouse />
                      <span>{room.type} • {room.capacity} guests</span>
                    </div>
                    {room.view && (
                      <div className={styles.detailItem}>
                        <BsGeoAltFill />
                        <span>{room.view} view</span>
                      </div>
                    )}
                    {room.price && (
                      <div className={styles.detailItem}>
                        <BsCreditCard />
                        <span>${room.price}/night</span>
                      </div>
                    )}
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className={styles.amenities}>
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className={styles.amenityTag}>
                          {amenity === 'WiFi' && <BsWifi />}
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className={styles.moreAmenities}>
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {booking && guest && (
                    <div className={styles.guestInfo}>
                      <h6><BsPeople /> Current Guests</h6>
                      <div className={styles.guestDetail}>
                        <BsPersonFill />
                        <div>
                          <strong>{guest.firstName} {guest.lastName}</strong>
                          {guest.email && <small className="d-block">{guest.email}</small>}
                        </div>
                      </div>
                      {companion && (
                        <div className={styles.guestDetail}>
                          <BsPersonFill />
                          <div>
                            <strong>{companion.firstName} {companion.lastName}</strong>
                            <small className="d-block">Companion</small>
                          </div>
                        </div>
                      )}
                      {booking.checkInDate && (
                        <div className={styles.dates}>
                          <BsCalendarEventFill />
                          <span>{booking.checkInDate} - {booking.checkOutDate}</span>
                        </div>
                      )}
                      {booking.paymentStatus && (
                        <div className={styles.payment}>
                          <BsCreditCard />
                          <span className={`${styles.paymentStatus} ${styles[booking.paymentStatus]}`}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : 
                             booking.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditRoom(roomId)}
                    >
                      <BsPencil />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteRoom(roomId)}
                    >
                      <BsTrash />
                    </button>
                  </div>
                  {!booking && room.status === 'available' && (
                    <button
                      className={styles.assignButton}
                      onClick={() => {
                        setBookingForm({...bookingForm, roomId});
                        setShowBookingModal(true);
                      }}
                    >
                      <BsPersonCheckFill /> Assign Guest
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className={styles.tableContainer}>
          <table className={styles.roomTable}>
            <thead>
              <tr>
                <th>Room</th>
                <th>Type</th>
                <th>Status</th>
                <th>Guest</th>
                <th>Dates</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(([roomId, room]) => {
                const [bookingId, booking] = getRoomBooking(roomId) || [null, null];
                const guest = booking?.guestId ? guests[booking.guestId] : null;
                const roomStatus = booking ? 'occupied' : room.status || 'available';

                return (
                  <tr key={roomId}>
                    <td>
                      <div className={styles.roomCell}>
                        <strong>{room.name}</strong>
                        <small>#{room.roomNumber}</small>
                      </div>
                    </td>
                    <td>{room.type} • {room.capacity} guests</td>
                    <td>
                      {roomStatus === 'available' && (
                        <span className={`${styles.badge} ${styles.available}`}>
                          Available
                        </span>
                      )}
                      {roomStatus === 'occupied' && (
                        <span className={`${styles.badge} ${styles.occupied}`}>
                          Occupied
                        </span>
                      )}
                      {booking?.status === 'pending' && (
                        <span className={`${styles.badge} ${styles.pending}`}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      {guest ? `${guest.firstName} ${guest.lastName}` : '-'}
                    </td>
                    <td>
                      {booking?.checkInDate ? 
                        `${booking.checkInDate} - ${booking.checkOutDate}` : '-'}
                    </td>
                    <td>
                      {booking?.paymentStatus ? (
                        <span className={`${styles.paymentStatus} ${styles[booking.paymentStatus]}`}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : 
                           booking.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditRoom(roomId)}
                        >
                          <BsPencil />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteRoom(roomId)}
                        >
                          <BsTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowRoomModal(false);
                  resetRoomForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Room Name *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Room Number</label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Type</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({...roomForm, type: e.target.value})}
                    className={styles.select}
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Capacity</label>
                  <input
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})}
                    className={styles.input}
                    min="1"
                    max="10"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Price per Night</label>
                  <input
                    type="number"
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({...roomForm, price: parseFloat(e.target.value)})}
                    className={styles.input}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Floor</label>
                  <input
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({...roomForm, floor: parseInt(e.target.value)})}
                    className={styles.input}
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>View</label>
                  <select
                    value={roomForm.view}
                    onChange={(e) => setRoomForm({...roomForm, view: e.target.value})}
                    className={styles.select}
                  >
                    <option value="">No specific view</option>
                    <option value="ocean">Ocean View</option>
                    <option value="garden">Garden View</option>
                    <option value="city">City View</option>
                    <option value="pool">Pool View</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({...roomForm, status: e.target.value})}
                    className={styles.select}
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Room description and special features..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Amenities</label>
                <div className={styles.amenitiesGrid}>
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={roomForm.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRoomForm({
                              ...roomForm,
                              amenities: [...roomForm.amenities, amenity]
                            });
                          } else {
                            setRoomForm({
                              ...roomForm,
                              amenities: roomForm.amenities.filter(a => a !== amenity)
                            });
                          }
                        }}
                        className={styles.checkbox}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowRoomModal(false);
                    resetRoomForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Room Booking</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowBookingModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Primary Guest *</label>
                  <select
                    value={bookingForm.guestId}
                    onChange={(e) => setBookingForm({...bookingForm, guestId: e.target.value})}
                    className={styles.select}
                    required
                  >
                    <option value="">Select guest...</option>
                    {getAvailableGuests().map(([guestId, guest]) => (
                      <option key={guestId} value={guestId}>
                        {guest.firstName} {guest.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Companion (Optional)</label>
                  <select
                    value={bookingForm.companionGuestId}
                    onChange={(e) => setBookingForm({...bookingForm, companionGuestId: e.target.value})}
                    className={styles.select}
                  >
                    <option value="">No companion</option>
                    {getAvailableGuests()
                      .filter(([guestId]) => guestId !== bookingForm.guestId)
                      .map(([guestId, guest]) => (
                        <option key={guestId} value={guestId}>
                          {guest.firstName} {guest.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Check-in Date</label>
                  <input
                    type="date"
                    value={bookingForm.checkInDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Check-out Date</label>
                  <input
                    type="date"
                    value={bookingForm.checkOutDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Total Amount</label>
                  <input
                    type="number"
                    value={bookingForm.totalAmount}
                    onChange={(e) => setBookingForm({...bookingForm, totalAmount: parseFloat(e.target.value)})}
                    className={styles.input}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Payment Status</label>
                  <select
                    value={bookingForm.paymentStatus}
                    onChange={(e) => setBookingForm({...bookingForm, paymentStatus: e.target.value})}
                    className={styles.select}
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Special Requests</label>
                <textarea
                  value={bookingForm.specialRequests}
                  onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Special requests or notes..."
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomManagement;
