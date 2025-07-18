import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, set, push, remove, onValue } from 'firebase/database';
import {
  BsGrid3X3,
  BsPeople,
  BsPersonFill,
  BsPlus,
  BsTrash,
  BsArrowsMove,
  BsShuffle,
  BsDownload,
  BsPrinter,
  BsZoomIn,
  BsZoomOut,
  BsSearch,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsPersonCheckFill,
  BsPersonXFill,
  BsClock
} from 'react-icons/bs';
import styles from './SeatingPlan.module.css';

function SeatingPlan({ guests = {} }) {
  const [tables, setTables] = useState({});
  const [seatingArrangements, setSeatingArrangements] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI State
  const [selectedTable, setSelectedTable] = useState(null);
  const [draggedGuest, setDraggedGuest] = useState(null);
  const [viewMode, setViewMode] = useState('visual'); // visual, list
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [autoSuggest, setAutoSuggest] = useState(false);

  // Table Form
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: 8,
    shape: 'round', // round, rectangle
    x: 100,
    y: 100,
    notes: ''
  });

  // Load data from Firebase
  useEffect(() => {
    const tablesRef = ref(db, 'tables');
    const seatingRef = ref(db, 'seating');

    const tablesUnsubscribe = onValue(tablesRef, (snapshot) => {
      setTables(snapshot.val() || {});
    });

    const seatingUnsubscribe = onValue(seatingRef, (snapshot) => {
      setSeatingArrangements(snapshot.val() || {});
    });

    return () => {
      tablesUnsubscribe();
      seatingUnsubscribe();
    };
  }, []);

  // Get confirmed guests
  const confirmedGuests = Object.entries(guests).filter(([_, guest]) => guest.attending === true);
  
  // Get assigned guests
  const assignedGuestIds = new Set(Object.values(seatingArrangements).map(s => s.guestId));
  
  // Get unassigned guests
  const unassignedGuests = confirmedGuests.filter(([guestId]) => !assignedGuestIds.has(guestId));

  // Create new table
  const handleCreateTable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tablesRef = ref(db, 'tables');
      const newTableRef = push(tablesRef);
      
      await set(newTableRef, {
        ...tableForm,
        createdAt: Date.now()
      });

      setShowTableModal(false);
      setTableForm({
        name: '',
        capacity: 8,
        shape: 'round',
        x: 100,
        y: 100,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating table:', error);
      setError('Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  // Delete table
  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Delete this table? All seating assignments will be removed.')) return;

    try {
      setLoading(true);
      
      // Remove table
      const tableRef = ref(db, `tables/${tableId}`);
      await remove(tableRef);
      
      // Remove all seating assignments for this table
      const seatingUpdates = {};
      Object.entries(seatingArrangements).forEach(([seatId, seat]) => {
        if (seat.tableId === tableId) {
          seatingUpdates[`seating/${seatId}`] = null;
        }
      });
      
      if (Object.keys(seatingUpdates).length > 0) {
        await Promise.all(
          Object.entries(seatingUpdates).map(([path, value]) => {
            const ref_ = ref(db, path);
            return remove(ref_);
          })
        );
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      setError('Failed to delete table');
    } finally {
      setLoading(false);
    }
  };

  // Assign guest to table
  const handleAssignGuest = async (guestId, tableId, seatNumber) => {
    try {
      setLoading(true);
      const seatingRef = ref(db, 'seating');
      const newSeatRef = push(seatingRef);
      
      await set(newSeatRef, {
        guestId,
        tableId,
        seatNumber,
        assignedAt: Date.now()
      });
    } catch (error) {
      console.error('Error assigning guest:', error);
      setError('Failed to assign guest');
    } finally {
      setLoading(false);
    }
  };

  // Remove guest from seat
  const handleRemoveGuest = async (seatId) => {
    try {
      setLoading(true);
      const seatRef = ref(db, `seating/${seatId}`);
      await remove(seatRef);
    } catch (error) {
      console.error('Error removing guest:', error);
      setError('Failed to remove guest');
    } finally {
      setLoading(false);
    }
  };

  // Auto-suggest seating based on groups
  const handleAutoSuggest = async () => {
    if (!window.confirm('This will clear current assignments and auto-arrange guests. Continue?')) return;

    try {
      setLoading(true);
      
      // Clear existing seating
      const clearPromises = Object.keys(seatingArrangements).map(seatId => {
        const seatRef = ref(db, `seating/${seatId}`);
        return remove(seatRef);
      });
      await Promise.all(clearPromises);

      // Group guests by relationship/group
      const groupedGuests = {};
      confirmedGuests.forEach(([guestId, guest]) => {
        const group = guest.group || guest.relationship || 'other';
        if (!groupedGuests[group]) {
          groupedGuests[group] = [];
        }
        groupedGuests[group].push([guestId, guest]);
        
        // Add companion if exists
        if (guest.companionName) {
          groupedGuests[group].push([`${guestId}_companion`, {
            firstName: guest.companionName.split(' ')[0] || '',
            lastName: guest.companionName.split(' ').slice(1).join(' ') || '',
            isCompanion: true,
            mainGuestId: guestId
          }]);
        }
      });

      // Assign groups to tables
      const tableArray = Object.entries(tables);
      let tableIndex = 0;
      let currentTableCapacity = 0;

      for (const [groupName, groupMembers] of Object.entries(groupedGuests)) {
        for (let i = 0; i < groupMembers.length; i++) {
          const [guestId, guest] = groupMembers[i];
          
          if (tableIndex >= tableArray.length) break;
          
          const [tableId, table] = tableArray[tableIndex];
          
          if (currentTableCapacity >= table.capacity) {
            tableIndex++;
            currentTableCapacity = 0;
            if (tableIndex >= tableArray.length) break;
          }

          await handleAssignGuest(guestId, tableArray[tableIndex][0], currentTableCapacity + 1);
          currentTableCapacity++;
        }
      }
    } catch (error) {
      console.error('Error auto-suggesting seating:', error);
      setError('Failed to auto-arrange seating');
    } finally {
      setLoading(false);
    }
  };

  // Get guests for a table
  const getTableGuests = (tableId) => {
    return Object.entries(seatingArrangements)
      .filter(([_, seat]) => seat.tableId === tableId)
      .map(([seatId, seat]) => ({
        seatId,
        ...seat,
        guest: guests[seat.guestId] || { 
          firstName: 'Unknown', 
          lastName: 'Guest',
          attending: false 
        }
      }))
      .sort((a, b) => a.seatNumber - b.seatNumber);
  };

  // Statistics
  const stats = {
    totalTables: Object.keys(tables).length,
    totalCapacity: Object.values(tables).reduce((sum, table) => sum + table.capacity, 0),
    assignedGuests: Object.keys(seatingArrangements).length,
    unassignedGuests: unassignedGuests.length,
    occupancyRate: Object.values(tables).reduce((sum, table) => sum + table.capacity, 0) > 0 
      ? Math.round((Object.keys(seatingArrangements).length / Object.values(tables).reduce((sum, table) => sum + table.capacity, 0)) * 100)
      : 0
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Seating Plan</h1>
          <p className={styles.subtitle}>Organize your guests with drag-and-drop ease</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton} onClick={handleAutoSuggest}>
            <BsShuffle /> Auto-Arrange
          </button>
          <button className={styles.actionButton}>
            <BsPrinter /> Print Plan
          </button>
          <button className={styles.actionButton}>
            <BsDownload /> Export
          </button>
          <button 
            className={styles.primaryButton}
            onClick={() => setShowTableModal(true)}
          >
            <BsPlus /> Add Table
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.sage}`}>
          <div className={styles.statIcon}><BsGrid3X3 /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.totalTables}</div>
            <div className={styles.statLabel}>Tables</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.blush}`}>
          <div className={styles.statIcon}><BsPeople /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.totalCapacity}</div>
            <div className={styles.statLabel}>Total Capacity</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cream}`}>
          <div className={styles.statIcon}><BsPersonCheckFill /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.assignedGuests}</div>
            <div className={styles.statLabel}>Assigned</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.neutral}`}>
          <div className={styles.statIcon}><BsClock /></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.occupancyRate}%</div>
            <div className={styles.statLabel}>Occupancy</div>
          </div>
        </div>
      </div>

      {/* Controls */}
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

        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'visual' ? styles.active : ''}`}
              onClick={() => setViewMode('visual')}
            >
              <BsGrid3X3 /> Visual
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <BsPeople /> List
            </button>
          </div>

          {viewMode === 'visual' && (
            <div className={styles.zoomControls}>
              <button 
                className={styles.zoomButton}
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              >
                <BsZoomOut />
              </button>
              <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
              <button 
                className={styles.zoomButton}
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              >
                <BsZoomIn />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <BsExclamationTriangleFill />
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {viewMode === 'visual' ? (
          <div className={styles.visualView}>
            {/* Seating Plan Canvas */}
            <div className={styles.planCanvas} style={{ transform: `scale(${zoomLevel})` }}>
              {Object.entries(tables).map(([tableId, table]) => {
                const tableGuests = getTableGuests(tableId);
                const isSelected = selectedTable === tableId;
                
                return (
                  <div
                    key={tableId}
                    className={`${styles.table} ${styles[table.shape]} ${isSelected ? styles.selected : ''}`}
                    style={{
                      left: table.x,
                      top: table.y
                    }}
                    onClick={() => setSelectedTable(isSelected ? null : tableId)}
                  >
                    <div className={styles.tableHeader}>
                      <span className={styles.tableName}>{table.name}</span>
                      <span className={styles.tableCapacity}>
                        {tableGuests.length}/{table.capacity}
                      </span>
                      <button
                        className={styles.deleteTableButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(tableId);
                        }}
                      >
                        <BsTrash />
                      </button>
                    </div>
                    
                    <div className={styles.tableSeats}>
                      {Array.from({ length: table.capacity }, (_, index) => {
                        const seatNumber = index + 1;
                        const assignedGuest = tableGuests.find(g => g.seatNumber === seatNumber);
                        
                        return (
                          <div
                            key={seatNumber}
                            className={`${styles.seat} ${assignedGuest ? styles.occupied : styles.empty}`}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedGuest && !assignedGuest) {
                                handleAssignGuest(draggedGuest, tableId, seatNumber);
                                setDraggedGuest(null);
                              }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {assignedGuest && (
                              <div className={styles.guestSeat}>
                                <span className={styles.guestName}>
                                  {assignedGuest.guest.firstName} {assignedGuest.guest.lastName[0]}.
                                </span>
                                <button
                                  className={styles.removeSeatButton}
                                  onClick={() => handleRemoveGuest(assignedGuest.seatId)}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unassigned Guests Sidebar */}
            <div className={styles.guestsSidebar}>
              <h3 className={styles.sidebarTitle}>
                Unassigned Guests ({unassignedGuests.length})
              </h3>
              <div className={styles.guestsList}>
                {unassignedGuests
                  .filter(([_, guest]) => {
                    if (!searchTerm) return true;
                    const name = `${guest.firstName} ${guest.lastName}`.toLowerCase();
                    return name.includes(searchTerm.toLowerCase());
                  })
                  .map(([guestId, guest]) => (
                    <div
                      key={guestId}
                      className={styles.guestItem}
                      draggable
                      onDragStart={() => setDraggedGuest(guestId)}
                      onDragEnd={() => setDraggedGuest(null)}
                    >
                      <div className={styles.guestInfo}>
                        <span className={styles.guestName}>
                          {guest.firstName} {guest.lastName}
                        </span>
                        {guest.companionName && (
                          <span className={styles.companion}>
                            + {guest.companionName}
                          </span>
                        )}
                        {(guest.dietaryRestrictions || guest.allergies) && (
                          <span className={styles.specialReqs}>
                            <BsExclamationTriangleFill />
                          </span>
                        )}
                      </div>
                      <BsArrowsMove className={styles.dragHandle} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className={styles.listView}>
            {Object.entries(tables).map(([tableId, table]) => {
              const tableGuests = getTableGuests(tableId);
              
              return (
                <div key={tableId} className={styles.tableCard}>
                  <div className={styles.tableCardHeader}>
                    <div className={styles.tableInfo}>
                      <h3 className={styles.tableCardName}>{table.name}</h3>
                      <span className={styles.tableStats}>
                        {tableGuests.length} of {table.capacity} seats filled
                      </span>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteTable(tableId)}
                    >
                      <BsTrash />
                    </button>
                  </div>
                  
                  <div className={styles.tableGuestsList}>
                    {tableGuests.map((assignedGuest) => (
                      <div key={assignedGuest.seatId} className={styles.assignedGuest}>
                        <div className={styles.seatNumber}>
                          {assignedGuest.seatNumber}
                        </div>
                        <div className={styles.guestDetails}>
                          <span className={styles.guestName}>
                            {assignedGuest.guest.firstName} {assignedGuest.guest.lastName}
                          </span>
                          {assignedGuest.guest.dietaryRestrictions && (
                            <span className={styles.dietary}>
                              {assignedGuest.guest.dietaryRestrictions}
                            </span>
                          )}
                        </div>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveGuest(assignedGuest.seatId)}
                        >
                          <BsTrash />
                        </button>
                      </div>
                    ))}
                    
                    {/* Empty seats */}
                    {Array.from({ length: table.capacity - tableGuests.length }, (_, index) => (
                      <div key={`empty-${index}`} className={styles.emptySeat}>
                        <div className={styles.seatNumber}>
                          {tableGuests.length + index + 1}
                        </div>
                        <span className={styles.emptyText}>Empty seat</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Table</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowTableModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTable} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Table Name *</label>
                  <input
                    type="text"
                    value={tableForm.name}
                    onChange={(e) => setTableForm({...tableForm, name: e.target.value})}
                    className={styles.input}
                    placeholder="e.g., Table 1, Family Table"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Capacity *</label>
                  <input
                    type="number"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({...tableForm, capacity: parseInt(e.target.value)})}
                    className={styles.input}
                    min="2"
                    max="20"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Shape</label>
                  <select
                    value={tableForm.shape}
                    onChange={(e) => setTableForm({...tableForm, shape: e.target.value})}
                    className={styles.select}
                  >
                    <option value="round">Round</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Notes</label>
                <textarea
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({...tableForm, notes: e.target.value})}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Special notes about this table..."
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowTableModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatingPlan;
