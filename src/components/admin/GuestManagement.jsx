import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, set, push, remove, onValue } from 'firebase/database';
import {
  BsPlus,
  BsPeople,
  BsPersonFill,
  BsPersonPlusFill,
  BsPersonCheckFill,
  BsPersonXFill,
  BsSearch,
  BsPencil,
  BsTrash,
  BsEyeFill,
  BsDownload,
  BsUpload,
  BsFilterLeft,
  BsHeart,
  BsExclamationTriangleFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsClock
} from 'react-icons/bs';
import styles from './GuestManagement.module.css';

function GuestManagement({ data = {} }) {
  const [guests, setGuests] = useState(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, confirmed, pending, declined
  const [viewMode, setViewMode] = useState('cards'); // cards, table
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [selectedGuests, setSelectedGuests] = useState(new Set());

  // Form State
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    attending: undefined,
    companions: [], // Array of companion objects
    foodPreference: 'No Reply', // Main guest food preference
    allergies: '', // Main guest allergies
    notes: '',
    group: '',
    relationship: '',
    address: '',
    specialRequirements: ''
  });

  // Load guests from Firebase
  useEffect(() => {
    const guestsRef = ref(db, 'rsvps');
    const unsubscribe = onValue(guestsRef, (snapshot) => {
      setGuests(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, []);

  // Reset form
  const resetForm = () => {
    setGuestForm({
      firstName: '',
      lastName: '',
      attending: undefined,
      companions: [],
      foodPreference: 'No Reply',
      allergies: '',
      notes: '',
      group: '',
      relationship: '',
      address: '',
      specialRequirements: ''
    });
    setEditingGuest(null);
  };

  // Helper functions for companions
  const addCompanion = () => {
    setGuestForm({
      ...guestForm,
      companions: [
        ...guestForm.companions,
        { firstName: '', lastName: '', foodPreference: 'No Reply', allergies: '' }
      ]
    });
  };

  const removeCompanion = (index) => {
    const newCompanions = guestForm.companions.filter((_, i) => i !== index);
    setGuestForm({ ...guestForm, companions: newCompanions });
  };

  const updateCompanion = (index, field, value) => {
    const newCompanions = [...guestForm.companions];
    newCompanions[index] = { ...newCompanions[index], [field]: value };
    setGuestForm({ ...guestForm, companions: newCompanions });
  };

  // Handle guest creation/update
  const handleSaveGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const guestData = {
        ...guestForm,
        updatedAt: Date.now(),
        ...(editingGuest ? {} : { createdAt: Date.now() })
      };

      if (editingGuest) {
        const guestRef = ref(db, `rsvps/${editingGuest}`);
        await set(guestRef, { ...guests[editingGuest], ...guestData });
      } else {
        const guestsRef = ref(db, 'rsvps');
        const newGuestRef = push(guestsRef);
        await set(newGuestRef, guestData);
      }

      setShowGuestModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving guest:', error);
      setError('Failed to save guest');
    } finally {
      setLoading(false);
    }
  };

  // Handle guest deletion
  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;

    try {
      setLoading(true);
      const guestRef = ref(db, `rsvps/${guestId}`);
      await remove(guestRef);
    } catch (error) {
      console.error('Error deleting guest:', error);
      setError('Failed to delete guest');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedGuests.size} selected guests?`)) return;

    try {
      setLoading(true);
      const deletePromises = Array.from(selectedGuests).map(guestId => {
        const guestRef = ref(db, `rsvps/${guestId}`);
        return remove(guestRef);
      });
      
      await Promise.all(deletePromises);
      setSelectedGuests(new Set());
    } catch (error) {
      console.error('Error deleting guests:', error);
      setError('Failed to delete selected guests');
    } finally {
      setLoading(false);
    }
  };

  // Edit guest
  const handleEditGuest = (guestId) => {
    const guest = guests[guestId];
    
    // Convert old data structure to new format
    const formData = {
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
      attending: guest.attending,
      companions: guest.companions || [],
      foodPreference: guest.foodPreference || 'No Reply',
      allergies: guest.allergies || '',
      notes: guest.notes || '',
      group: guest.group || '',
      relationship: guest.relationship || '',
      address: guest.address || '',
      specialRequirements: guest.specialRequirements || ''
    };

    // Handle legacy companion data
    if (guest.companionName && !formData.companions.length) {
      formData.companions = [{
        firstName: guest.companionName.split(' ')[0] || '',
        lastName: guest.companionName.split(' ').slice(1).join(' ') || '',
        foodPreference: guest.companionDietaryRestrictions || 'No Reply',
        allergies: guest.companionAllergies || ''
      }];
    }

    setGuestForm(formData);
    setEditingGuest(guestId);
    setShowGuestModal(true);
  };

  // Filter guests
  const filteredGuests = Object.entries(guests).filter(([_, guest]) => {
    const matchesSearch = !searchTerm || 
      `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.companionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.companions && guest.companions.some(comp => 
        `${comp.firstName} ${comp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'confirmed' && guest.attending === true) ||
      (filterStatus === 'pending' && guest.attending === undefined) ||
      (filterStatus === 'declined' && guest.attending === false);

    return matchesSearch && matchesFilter;
  });

  // Statistics
  const stats = {
    total: Object.keys(guests).length,
    confirmed: Object.values(guests).filter(g => g.attending === true).length,
    pending: Object.values(guests).filter(g => g.attending === undefined).length,
    declined: Object.values(guests).filter(g => g.attending === false).length,
    withDietaryRestrictions: Object.values(guests).filter(g => g.dietaryRestrictions || g.allergies).length,
    withCompanions: Object.values(guests).filter(g => g.companions && g.companions.length > 0).length,
    totalAttendees: Object.values(guests).reduce((total, guest) => {
      return total + 1 + (guest.companions?.length || 0);
    }, 0)
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Guest Management</h1>
          <p className={styles.subtitle}>Manage your wedding guest list with ease</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton}>
            <BsUpload /> Import CSV
          </button>
          <button className={styles.actionButton}>
            <BsDownload /> Export
          </button>
          <button 
            className={`${styles.primaryButton}`}
            onClick={() => setShowGuestModal(true)}
          >
            <BsPlus /> Add Guest
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.sage}`}>
          <div className={styles.statIcon}>
            <BsPeople />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total Guests</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.blush}`}>
          <div className={styles.statIcon}>
            <BsCheckCircleFill />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.confirmed}</div>
            <div className={styles.statLabel}>Confirmed</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cream}`}>
          <div className={styles.statIcon}>
            <BsClock />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.neutral}`}>
          <div className={styles.statIcon}>
            <BsXCircleFill />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.declined}</div>
            <div className={styles.statLabel}>Declined</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.controlsBar}>
        <div className={styles.searchContainer}>
          <BsSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search guests..."
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
            <option value="all">All Guests</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Response</option>
            <option value="declined">Declined</option>
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
              <BsFilterLeft /> Table
            </button>
          </div>
        </div>

        {selectedGuests.size > 0 && (
          <div className={styles.bulkActions}>
            <span className={styles.selectedCount}>
              {selectedGuests.size} selected
            </span>
            <button 
              className={styles.deleteButton}
              onClick={handleBulkDelete}
            >
              <BsTrash /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <BsExclamationTriangleFill />
          {error}
        </div>
      )}

      {/* Guest List */}
      {viewMode === 'cards' ? (
        <div className={styles.guestGrid}>
          {filteredGuests.map(([guestId, guest]) => (
            <div key={guestId} className={styles.guestCard}>
              <div className={styles.cardHeader}>
                <div className={styles.guestInfo}>
                  <h3 className={styles.guestName}>
                    {guest.firstName} {guest.lastName}
                  </h3>
                  <p className={styles.guestEmail}>{guest.email}</p>
                </div>
                <div className={styles.cardActions}>
                  <input
                    type="checkbox"
                    checked={selectedGuests.has(guestId)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedGuests);
                      if (e.target.checked) {
                        newSelected.add(guestId);
                      } else {
                        newSelected.delete(guestId);
                      }
                      setSelectedGuests(newSelected);
                    }}
                    className={styles.checkbox}
                  />
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.statusBadge}>
                  {guest.attending === true && (
                    <span className={`${styles.badge} ${styles.confirmed}`}>
                      <BsPersonCheckFill /> Confirmed
                    </span>
                  )}
                  {guest.attending === false && (
                    <span className={`${styles.badge} ${styles.declined}`}>
                      <BsPersonXFill /> Declined
                    </span>
                  )}
                  {guest.attending === undefined && (
                    <span className={`${styles.badge} ${styles.pending}`}>
                      <BsClock /> Pending
                    </span>
                  )}
                </div>

                {guest.companionName && (
                  <div className={styles.companion}>
                    <BsPersonPlusFill />
                    <span>+ {guest.companionName}</span>
                  </div>
                )}

                {(guest.dietaryRestrictions || guest.allergies) && (
                  <div className={styles.specialRequirements}>
                    <BsExclamationTriangleFill />
                    <span>Special Requirements</span>
                  </div>
                )}

                {guest.relationship && (
                  <div className={styles.relationship}>
                    <BsHeart />
                    <span>{guest.relationship}</span>
                  </div>
                )}

                {guest.notes && (
                  <div className={styles.notes}>
                    <p>"{guest.notes}"</p>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditGuest(guestId)}
                >
                  <BsPencil /> Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteGuest(guestId)}
                >
                  <BsTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.guestTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGuests(new Set(filteredGuests.map(([id]) => id)));
                      } else {
                        setSelectedGuests(new Set());
                      }
                    }}
                    checked={selectedGuests.size === filteredGuests.length}
                  />
                </th>
                <th>Name</th>
                <th>Status</th>
                <th>Party Size</th>
                <th>Special Requirements</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map(([guestId, guest]) => (
                <tr key={guestId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedGuests.has(guestId)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedGuests);
                        if (e.target.checked) {
                          newSelected.add(guestId);
                        } else {
                          newSelected.delete(guestId);
                        }
                        setSelectedGuests(newSelected);
                      }}
                    />
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <strong>{guest.firstName} {guest.lastName}</strong>
                      {guest.relationship && (
                        <small className={styles.relationshipTag}>
                          {guest.relationship}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    {guest.attending === true && (
                      <span className={`${styles.badge} ${styles.confirmed}`}>
                        Confirmed
                      </span>
                    )}
                    {guest.attending === false && (
                      <span className={`${styles.badge} ${styles.declined}`}>
                        Declined
                      </span>
                    )}
                    {guest.attending === undefined && (
                      <span className={`${styles.badge} ${styles.pending}`}>
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.partySizeCell}>
                      <strong>{1 + (guest.companions?.length || 0)}</strong>
                      <small>guest{(guest.companions?.length || 0) > 0 ? 's' : ''}</small>
                    </div>
                  </td>
                  <td>
                    {(guest.dietaryRestrictions || guest.allergies) ? (
                      <span className={styles.hasRequirements}>
                        <BsExclamationTriangleFill /> Yes
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditGuest(guestId)}
                      >
                        <BsPencil />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteGuest(guestId)}
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guest Modal */}
      {showGuestModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingGuest ? 'Edit Guest' : 'Add New Guest'}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowGuestModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name *</label>
                  <input
                    type="text"
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm({...guestForm, firstName: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name *</label>
                  <input
                    type="text"
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm({...guestForm, lastName: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>RSVP Status</label>
                  <select
                    value={guestForm.attending === undefined ? '' : guestForm.attending.toString()}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value === 'true';
                      setGuestForm({...guestForm, attending: value});
                    }}
                    className={styles.select}
                  >
                    <option value="">Pending Response</option>
                    <option value="true">Confirmed</option>
                    <option value="false">Declined</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Relationship</label>
                  <select
                    value={guestForm.relationship}
                    onChange={(e) => setGuestForm({...guestForm, relationship: e.target.value})}
                    className={styles.select}
                  >
                    <option value="">Select relationship</option>
                    <option value="Family">Family</option>
                    <option value="Close Friend">Close Friend</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Extended Family">Extended Family</option>
                    <option value="Wedding Party">Wedding Party</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Main Guest Food Preferences */}
              <div className={styles.sectionTitle}>Food Preferences & Allergies</div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Food Preference</label>
                  <select
                    value={guestForm.foodPreference}
                    onChange={(e) => setGuestForm({...guestForm, foodPreference: e.target.value})}
                    className={styles.select}
                  >
                    <option value="No Reply">No Reply</option>
                    <option value="Meat">Meat</option>
                    <option value="Fish">Fish</option>
                    <option value="Meat & Fish">Meat & Fish</option>
                    <option value="Vegetarian">Vegetarian</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Allergies</label>
                  <input
                    type="text"
                    value={guestForm.allergies}
                    onChange={(e) => setGuestForm({...guestForm, allergies: e.target.value})}
                    className={styles.input}
                    placeholder="e.g., Nuts, Shellfish, Dairy"
                  />
                </div>
              </div>

              {/* Companions Section */}
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Companions</div>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addCompanion}
                >
                  <BsPlus /> Add Companion
                </button>
              </div>

              {guestForm.companions.map((companion, index) => (
                <div key={index} className={styles.companionCard}>
                  <div className={styles.companionHeader}>
                    <h4>Companion {index + 1}</h4>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeCompanion(index)}
                    >
                      <BsTrash />
                    </button>
                  </div>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>First Name</label>
                      <input
                        type="text"
                        value={companion.firstName}
                        onChange={(e) => updateCompanion(index, 'firstName', e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Last Name</label>
                      <input
                        type="text"
                        value={companion.lastName}
                        onChange={(e) => updateCompanion(index, 'lastName', e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Food Preference</label>
                      <select
                        value={companion.foodPreference}
                        onChange={(e) => updateCompanion(index, 'foodPreference', e.target.value)}
                        className={styles.select}
                      >
                        <option value="No Reply">No Reply</option>
                        <option value="Meat">Meat</option>
                        <option value="Fish">Fish</option>
                        <option value="Meat & Fish">Meat & Fish</option>
                        <option value="Vegetarian">Vegetarian</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Allergies</label>
                      <input
                        type="text"
                        value={companion.allergies}
                        onChange={(e) => updateCompanion(index, 'allergies', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Nuts, Shellfish, Dairy"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.formGroup}>
                <label className={styles.label}>Special Requirements</label>
                <input
                  type="text"
                  value={guestForm.specialRequirements}
                  onChange={(e) => setGuestForm({...guestForm, specialRequirements: e.target.value})}
                  className={styles.input}
                  placeholder="e.g., Wheelchair access, Baby chair"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Notes</label>
                <textarea
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm({...guestForm, notes: e.target.value})}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Any additional notes about this guest..."
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowGuestModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingGuest ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestManagement;
