import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebaseConfig';
import { ref, get, push, set, runTransaction } from 'firebase/database';

function RsvpForm() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    attending: '',
    needsAccommodation: false,
    selected_room: '',
    group: ''
  });
  const [guestDetails, setGuestDetails] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showRoomBooking, setShowRoomBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchAvailableRooms = useCallback(async (guestCount) => {
    if (!guestCount || guestCount <= 0) {
      setAvailableRooms([]);
      return;
    }
    try {
      const roomsRef = ref(db, 'rooms');
      const snapshot = await get(roomsRef);
      const roomsData = snapshot.val();

      if (roomsData) {
        console.log("Raw room data:", roomsData); // Add logging

        const filteredRooms = Object.entries(roomsData)
          .map(([roomId, room]) => ({ id: roomId, name: room.name, description: room.description, price: room.price, capacity: room.capacity, isAvailable: room.available, image: room.image }))
          .filter(room => {
            console.log(`Room: ${room.name}, isAvailable: ${room.available}, capacity: ${room.capacity}, guestCount: ${guestCount}`);
            return room.isAvailable === true && parseInt(room.capacity, 10) >= parseInt(guestCount, 10);
          })
          .map(room => ({ ...room, price: parseFloat(room.price || 0) }));

        console.log("Filtered room data:", filteredRooms); // Add logging
        setAvailableRooms(filteredRooms);
      } else {
        setAvailableRooms([]);
      }
    } catch (roomError) {
      console.error("Error fetching available rooms:", roomError);
      setError(t('errorLoadingRooms', 'Error loading available rooms.'));
      setAvailableRooms([]);
    } finally {
    }
  }, [t]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setSubmitSuccess(false);

    const fetchGroups = async () => {
      try {
        const groupsRef = ref(db, 'groups');
        const groupsSnapshot = await get(groupsRef);
        const fetchedGroupsData = groupsSnapshot.val() || {};

        const groupsArray = Object.entries(fetchedGroupsData).map(([id, data]) => ({
          id: id,
          name: data.name || 'Unnamed Group',
          guestCount: data.guestCount || 0
        }));

        if (isMounted) {
          setGroups(groupsArray);
          setFormData({
            attending: '',
            needsAccommodation: false,
            selected_room: '',
            group: ''
          });
          setGuestDetails([]);
          setSelectedGroup(null);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
        if (isMounted) {
          setError(t('errorLoadingGroups', 'Error loading groups. Please try again later.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGroups();

    return () => {
      isMounted = false;
    };
  }, [t]);

  useEffect(() => {
    if (formData.needsAccommodation && selectedGroup?.guestCount > 0) {
      setShowRoomBooking(true);
      fetchAvailableRooms(selectedGroup.guestCount);
    } else {
      setShowRoomBooking(false);
      setAvailableRooms([]);
      setFormData(prevData => ({ ...prevData, selected_room: '' }));
    }
  }, [formData.needsAccommodation, selectedGroup, fetchAvailableRooms]);

  const handleGroupChange = (event) => {
    const groupId = event.target.value;

    const fetchGroupData = async () => {
      try {
        const groupRef = ref(db, `groups/${groupId}`);
        const groupSnapshot = await get(groupRef);
        const groupData = groupSnapshot.val();

        if (groupData) {
          setSelectedGroup(groupData);
          setFormData(prevData => ({ ...prevData, group: groupId }));

          if (groupData.guestCount > 0) {
            setGuestDetails(Array.from({ length: groupData.guestCount }, (_, index) => ({
              name: '',
              phone: index === 0 ? '' : undefined,
              email: index === 0 ? '' : undefined,
              foodPreference: '',
              allergies: ''
            })));
          } else {
            setGuestDetails([]);
          }
        } else {
          setSelectedGroup(null);
          setFormData(prevData => ({ ...prevData, group: '' }));
          setGuestDetails([]);
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
        setError(t('errorLoadingGroups', 'Error loading groups. Please try again later.'));
        setSelectedGroup(null);
        setFormData(prevData => ({ ...prevData, group: '' }));
        setGuestDetails([]);
      }
    };

    fetchGroupData();
    setSubmitSuccess(false);
  };

  const handleGeneralChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSubmitSuccess(false);
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuestChange = (index, field, value) => {
    setSubmitSuccess(false);
    setGuestDetails(prevDetails => {
      const newDetails = [...prevDetails];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return newDetails;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSubmitSuccess(false);

    if (!selectedGroup) {
      setError(t('errorSelectGroup', 'Please select your group.'));
      setIsLoading(false);
      return;
    }
    if (!formData.attending) {
      setError(t('errorAttendingRequired', 'Please indicate if you are attending.'));
      setIsLoading(false);
      return;
    }

    if (guestDetails.some(guest => !guest.name.trim())) {
      setError(t('errorGuestNameRequired', 'Please enter a name for each guest.'));
      setIsLoading(false);
      return;
    }
    if (guestDetails[0] && guestDetails[0].email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails[0].email)) {
      setError(t('errorInvalidEmail', 'Please enter a valid email for Guest 1.'));
      setIsLoading(false);
      return;
    }

    if (formData.needsAccommodation && !formData.selected_room) {
      setError(t('errorSelectRoom', 'Please select a room if you need accommodation.'));
      setIsLoading(false);
      return;
    }

    const rsvpData = {
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      attending: formData.attending,
      needsAccommodation: formData.needsAccommodation,
      selectedRoomId: formData.needsAccommodation ? formData.selected_room : null,
      guests: guestDetails,
      submittedAt: new Date().toISOString()
    };

    try {
      const rsvpRef = ref(db, 'rsvps');
      const newRsvpEntryRef = push(rsvpRef);

      if (rsvpData.selectedRoomId) {
        const roomRef = ref(db, `rooms/${rsvpData.selectedRoomId}`);
        const { committed, snapshot } = await runTransaction(roomRef, (currentData) => {
          if (currentData === null) {
            return undefined;
          }
          if (currentData.isAvailable === true) {
            return { ...currentData, isAvailable: false };
          } else {
            return undefined;
          }
        });

        if (committed && snapshot.exists()) {
          await set(newRsvpEntryRef, rsvpData);
          setSubmitSuccess(true);
          setSelectedGroup(null);
          setFormData({ attending: '', needsAccommodation: false, selected_room: '', group: '' });
          setGuestDetails([]);
          setShowRoomBooking(false);
        } else {
          throw new Error(t('errorRoomNotAvailable', 'Selected room is no longer available. Please choose another.'));
        }
      } else {
        await set(newRsvpEntryRef, rsvpData);
        setSubmitSuccess(true);
        setSelectedGroup(null);
        setFormData({ attending: '', needsAccommodation: false, selected_room: '', group: '' });
        setGuestDetails([]);
        setShowRoomBooking(false);
      }
    } catch (dbError) {
      console.error("Error submitting RSVP:", dbError);
      setError(dbError.message || t('errorSubmit', 'Failed to submit RSVP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="rsvp-form" onSubmit={handleSubmit} className="rsvp-form-container">
      {error && !submitSuccess && <div className="alert alert-danger">{error}</div>}
      {submitSuccess && <div className="alert alert-success">{t('submitSuccess', 'RSVP submitted successfully!')}</div>}

      <div className="form-group">
        <label htmlFor="group">{t('group', 'Group')}{' *'}</label>
        <select
          id="group"
          name="group"
          className="form-control"
          value={formData.group || ''}
          onChange={handleGroupChange}
          required
        >
          <option value="">{t('selectGroup', 'Select Group')}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name} ({group.guestCount} {t('guests', 'guests')})</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>{t('attending', 'Attending?')}{' *'}</label>
        <div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="attending" id="attendingYes" value="Yes" checked={formData.attending === 'Yes'} onChange={handleGeneralChange} required />
            <label className="form-check-label" htmlFor="attendingYes">{t('yes', 'Yes')}</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="attending" id="attendingNo" value="No" checked={formData.attending === 'No'} onChange={handleGeneralChange} required />
            <label className="form-check-label" htmlFor="attendingNo">{t('no', 'No')}</label>
          </div>
        </div>
      </div>

      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="needsAccommodation" name="needsAccommodation" checked={formData.needsAccommodation} onChange={handleGeneralChange} />
        <label className="form-check-label" htmlFor="needsAccommodation">{t('requestRoom', 'Need Accommodation?')}</label>
      </div>

      {selectedGroup && guestDetails.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h4>{t('guestDetails', 'Guest Details')} ({selectedGroup.name})</h4>
          {guestDetails.map((guest, index) => (
            <div key={index} className="guest-details" style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < guestDetails.length - 1 ? '1px dashed #ccc' : 'none' }}>
              <h5>{t('guest', 'Guest')} {index + 1}</h5>
              <div className="row">
                <div className="form-group col-md-3">
                  <label htmlFor={`guest-${index}-name`}>{t('name', 'Name')}{' *'}</label>
                  <input
                    type="text"
                    id={`guest-${index}-name`}
                    name={`guest-${index}-name`}
                    className="form-control"
                    value={guest.name}
                    onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                 <div className="form-group col-md-3">
                      <label htmlFor={`guest-${index}-phone`}>{t('phone', 'Phone')}</label>
                      <input
                        type="tel"
                        id={`guest-${index}-phone`}
                        name={`guest-${index}-phone`}
                        className="form-control"
                        value={guest.phone || ''}
                        onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <label htmlFor={`guest-${index}-email`}>{t('email', 'Email')}</label>
                      <input
                        type="email"
                        id={`guest-${index}-email`}
                        name={`guest-${index}-email`}
                        className="form-control"
                        value={guest.email || ''}
                        onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                      />
                    </div>
                 
                <div className="form-group col-md-3">
                  <label htmlFor={`guest-${index}-foodPreference`}>{t('foodPreference', 'Food Preference')}</label>
                  <input
                    type="text"
                    id={`guest-${index}-foodPreference`}
                    name={`guest-${index}-foodPreference`}
                    className="form-control"
                    value={guest.foodPreference}
                    onChange={(e) => handleGuestChange(index, 'foodPreference', e.target.value)}
                  />
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor={`guest-${index}-allergies`}>{t('allergies', 'Allergies')}</label>
                  <input
                    type="text"
                    id={`guest-${index}-allergies`}
                    name={`guest-${index}-allergies`}
                    className="form-control"
                    value={guest.allergies}
                    onChange={(e) => handleGuestChange(index, 'allergies', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRoomBooking && (
        <div id="room-booking-section" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
          <h3>{t('roomBooking', 'Room Booking')}</h3>
          <div id="available-rooms-container" className="available-rooms-grid">
            {availableRooms.length === 0 && !isLoading && <p>{t('noRoomsAvailable', 'Sorry, no suitable rooms are currently available.')}</p>}
            {availableRooms.map(room => (
              <div key={room.id} className="room-card">
                <img src={room.image} className="room-image" alt={room.name || "Room Image"} />
                <div className="room-details">
                  <h5 className="room-title">{room.name || t('unnamedRoom', 'Unnamed Room')}</h5>
                  <p className="room-capacity">
                    <strong>{t('capacity', 'Capacity')}:</strong> {room.capacity || t('notAvailable', 'N/A')}
                  </p>
                  <p className="room-price">
                    <strong>{t('price', 'Price')}:</strong> {room.price ? `€${room.price} / ${t('night', 'night')}` : t('notAvailable', 'N/A')}
                  </p>
                  <p className="room-description"><small className="text-muted">{room.description}</small></p>
                </div>
              </div>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="selected-room">{t('selectRoom', 'Select Room')}{' *'}</label>
            <select
              id="selected-room"
              name="selected_room"
              className="form-control"
              value={formData.selected_room || ''}
              onChange={handleGeneralChange}
              required={formData.needsAccommodation}
              disabled={availableRooms.length === 0}
            >
              <option value="">{t('noRoomSelected', 'No Room Selected')}</option>
              {availableRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name || t('unnamedRoom', 'Unnamed Room')}
                  {room.price && ` (€${room.price})`}
                  {` - ${t('capacity', 'Capacity')}: ${room.capacity}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary mt-3" disabled={isLoading}>
        {isLoading ? t('submitting', 'Submitting...') : t('submit', 'Submit')}
      </button>
    </form>
  );
}

export default RsvpForm;
