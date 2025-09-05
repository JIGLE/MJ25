import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import GiftTracker from './GiftTracker';
import VendorManagement from './VendorManagement';
import BudgetTracker from './BudgetTracker';
import EventTimeline from './EventTimeline';
import WeddingChecklist from './WeddingChecklist';
import DashboardOverview from './DashboardOverview';
import {
  BsHouseFill,
  BsPeopleFill,
  BsGiftFill,
  BsCalendarEventFill,
  BsPersonLinesFill,
  BsCurrencyDollar,
  BsClipboardCheckFill,
  BsGridFill,
  BsBarChartFill,
  BsMoonFill,
  BsSunFill,
  BsBoxArrowRight
} from 'react-icons/bs';
import '../../styles/themes.css';
import styles from './WeddingDashboard.module.css';

function WeddingDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    gifts: {},
    vendors: {},
    budget: {},
    timeline: {},
    checklist: {}
  });
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
    localStorage.setItem('adminTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Load all data from Firebase
  useEffect(() => {
    const refs = {
      gifts: ref(db, 'gifts'),
      vendors: ref(db, 'vendors'),
      budget: ref(db, 'budget'),
      timeline: ref(db, 'timeline'),
      checklist: ref(db, 'checklist')
    };

    const unsubscribes = Object.entries(refs).map(([key, dbRef]) =>
      onValue(dbRef, (snapshot) => {
        setDashboardData(prev => ({
          ...prev,
          [key]: snapshot.val() || {}
        }));
      })
    );

    setLoading(false);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BsBarChartFill, color: 'sage', section: 'planning' },
  // Removed: Guest Management, Seating Plan, Room Management
    { id: 'gifts', label: 'Gift Tracker', icon: BsGiftFill, color: 'blush', section: 'planning' },
    { id: 'timeline', label: 'Event Timeline', icon: BsCalendarEventFill, color: 'blush', section: 'planning' },
    { id: 'vendors', label: 'Vendor Management', icon: BsPersonLinesFill, color: 'cream', section: 'planning' },
    { id: 'budget', label: 'Budget Tracker', icon: BsCurrencyDollar, color: 'cream', section: 'planning' },
    { id: 'checklist', label: 'Wedding Checklist', icon: BsClipboardCheckFill, color: 'cream', section: 'planning' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview data={dashboardData} />;
  // removed guest, seating, and room sections
      case 'gifts':
        return <GiftTracker data={dashboardData.gifts} />;
      case 'timeline':
        return <EventTimeline data={dashboardData.timeline} />;
      case 'vendors':
        return <VendorManagement data={dashboardData.vendors} />;
      case 'budget':
        return <BudgetTracker data={dashboardData.budget} />;
      case 'checklist':
        return <WeddingChecklist data={dashboardData.checklist} />;
      default:
        return <DashboardOverview data={dashboardData} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your wedding dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <h1 className={styles.logoText}>Wedding Planning</h1>
            <p className={styles.subtitle}>Manage your special day</p>
          </div>
          
          <div className={styles.headerControls}>
            <button 
              onClick={handleThemeToggle} 
              className={styles.themeToggle}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
            </button>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
              title="Logout"
            >
              <BsBoxArrowRight />
            </button>
          </div>
        </div>
        
        <div className={styles.navList}>
          <div className={styles.navSection}>
            <h3 className={styles.sectionTitle}>Wedding Planning</h3>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''} ${styles[item.color]}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}

export default WeddingDashboard;
