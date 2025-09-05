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
  const { checklist = {} } = data || {};

  const checklistStats = {
    total: Object.keys(checklist).length,
    completed: Object.values(checklist).filter(item => item.completed).length
  };

  const quickActions = [
    { label: 'Wedding Checklist', icon: BsClipboardCheckFill, color: 'cream', action: 'checklist' },
    { label: 'Vendor Management', icon: BsPersonCheckFill, color: 'blush', action: 'vendors' }
  ];

  const recentActivity = [
    { type: 'task', message: 'Venue decorations confirmed', time: '1 day ago', icon: BsCheckCircleFill },
    { type: 'task', message: 'Flowers ordered - completed', time: '2 days ago', icon: BsCheckCircleFill },
    { type: 'task', message: 'Vendor contracts signed', time: '3 days ago', icon: BsPersonCheckFill }
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
  {/* Removed Guests and Rooms cards - kept main summary and checklist */}
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

            {/* Removed RSVP Responses and Room Assignments progress - keeping checklist only */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
