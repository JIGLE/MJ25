import React from 'react';
import {
  BsPeopleFill,
  BsHouseFill,
  BsCalendarEventFill,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsArrowUpRight,
  BsPersonCheckFill,
  BsPersonXFill,
  BsPersonPlusFill,
  BsClipboardCheckFill
} from 'react-icons/bs';
import styles from './DashboardOverview.module.css';

function DashboardOverview({ data }) {
  const { guests = {}, rooms = {}, bookings = {}, checklist = {} } = data;

  // Calculate statistics
  const guestStats = {
    total: Object.keys(guests).length,
    confirmed: Object.values(guests).filter(g => g.attending === true).length,
    declined: Object.values(guests).filter(g => g.attending === false).length,
    pending: Object.values(guests).filter(g => g.attending === undefined).length
  };

  const roomStats = {
    total: Object.keys(rooms).length,
    occupied: Object.values(bookings).length,
    available: Object.keys(rooms).length - Object.values(bookings).length
  };

  const checklistStats = {
    total: Object.keys(checklist).length,
    completed: Object.values(checklist).filter(item => item.completed).length
  };

  const quickActions = [
    { label: 'Add Guest', icon: BsPersonPlusFill, color: 'sage', action: 'guests' },
    { label: 'Manage Seating', icon: BsPeopleFill, color: 'sage', action: 'seating' },
    { label: 'Room Assignments', icon: BsHouseFill, color: 'blush', action: 'rooms' },
    { label: 'Wedding Checklist', icon: BsClipboardCheckFill, color: 'cream', action: 'checklist' }
  ];

  const recentActivity = [
    { type: 'guest', message: 'Sarah & Mike confirmed attendance', time: '2 hours ago', icon: BsPersonCheckFill },
    { type: 'room', message: 'Honeymoon suite assigned', time: '4 hours ago', icon: BsHouseFill },
    { type: 'task', message: 'Venue decorations confirmed', time: '1 day ago', icon: BsCheckCircleFill },
    { type: 'task', message: 'Flowers ordered - completed', time: '2 days ago', icon: BsCheckCircleFill }
  ];

  const upcomingTasks = [
    { task: 'Send final headcount to caterer', dueDate: 'In 3 days', priority: 'high' },
    { task: 'Confirm vendor arrival times', dueDate: 'In 1 week', priority: 'medium' },
    { task: 'Finalize seating arrangements', dueDate: 'In 2 weeks', priority: 'medium' },
    { task: 'Send thank you notes', dueDate: 'In 1 month', priority: 'low' }
  ];

  return (
    <div className={styles.overview}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Wedding Dashboard</h1>
          <p className={styles.subtitle}>Your special day at a glance</p>
        </div>
        <div className={styles.dateInfo}>
          <div className={styles.countdown}>
            <span className={styles.countdownNumber}>42</span>
            <span className={styles.countdownLabel}>days to go</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.sage}`}>
          <div className={styles.statHeader}>
            <BsPeopleFill className={styles.statIcon} />
            <span className={styles.statLabel}>Guests</span>
          </div>
          <div className={styles.statNumber}>{guestStats.confirmed}</div>
          <div className={styles.statDetail}>
            of {guestStats.total} confirmed
          </div>
          <div className={styles.statBreakdown}>
            <span className={styles.confirmed}>{guestStats.confirmed} confirmed</span>
            <span className={styles.pending}>{guestStats.pending} pending</span>
            <span className={styles.declined}>{guestStats.declined} declined</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.blush}`}>
          <div className={styles.statHeader}>
            <BsHouseFill className={styles.statIcon} />
            <span className={styles.statLabel}>Rooms</span>
          </div>
          <div className={styles.statNumber}>{roomStats.occupied}</div>
          <div className={styles.statDetail}>
            of {roomStats.total} assigned
          </div>
          <div className={styles.statBreakdown}>
            <span className={styles.occupied}>{roomStats.occupied} occupied</span>
            <span className={styles.available}>{roomStats.available} available</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button key={index} className={`${styles.actionCard} ${styles[action.color]}`}>
                <Icon className={styles.actionIcon} />
                <span className={styles.actionLabel}>{action.label}</span>
                <BsArrowUpRight className={styles.actionArrow} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent Activity */}
        <div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                    <Icon />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityMessage}>{activity.message}</p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className={styles.tasksCard}>
          <h3 className={styles.cardTitle}>Upcoming Tasks</h3>
          <div className={styles.tasksList}>
            {upcomingTasks.map((task, index) => (
              <div key={index} className={styles.taskItem}>
                <div className={styles.taskContent}>
                  <p className={styles.taskDescription}>{task.task}</p>
                  <span className={styles.taskDue}>{task.dueDate}</span>
                </div>
                <div className={`${styles.priorityBadge} ${styles[task.priority]}`}>
                  {task.priority === 'high' && <BsExclamationTriangleFill />}
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        <div className={styles.progressCard}>
          <h3 className={styles.cardTitle}>Planning Progress</h3>
          <div className={styles.progressItems}>
            <div className={styles.progressItem}>
              <div className={styles.progressLabel}>
                <span>Checklist Completion</span>
                <span className={styles.progressPercent}>
                  {checklistStats.total > 0 ? Math.round((checklistStats.completed / checklistStats.total) * 100) : 0}%
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill}
                  style={{ 
                    width: `${checklistStats.total > 0 ? (checklistStats.completed / checklistStats.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.progressItem}>
              <div className={styles.progressLabel}>
                <span>RSVP Responses</span>
                <span className={styles.progressPercent}>
                  {guestStats.total > 0 ? Math.round(((guestStats.confirmed + guestStats.declined) / guestStats.total) * 100) : 0}%
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill}
                  style={{ 
                    width: `${guestStats.total > 0 ? ((guestStats.confirmed + guestStats.declined) / guestStats.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.progressItem}>
              <div className={styles.progressLabel}>
                <span>Room Assignments</span>
                <span className={styles.progressPercent}>
                  {roomStats.total > 0 ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0}%
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill}
                  style={{ 
                    width: `${roomStats.total > 0 ? (roomStats.occupied / roomStats.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
