import React, { useState, useEffect } from 'react';
// Removed useTranslation import
import { auth, db } from '../firebaseConfig'; // Import Firebase services
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set, push, onValue, off } from 'firebase/database';
import { Tabs, Tab, Modal, Form, Button, Table, Alert } from 'react-bootstrap'; // Import Bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import '../components/admin/RsvpFieldsManager'; // Import the new component
import '../components/admin/RoomsManager'; // Import the new component
import '../components/admin/RsvpDataManager'; // Import the new component
import '../components/admin/GroupsManager'; // Import the new component
import '../../public/css/admin.css';
import RsvpFieldsManager from '../components/admin/RsvpFieldsManager';
import RoomsManager from '../components/admin/RoomsManager';
import RsvpDataManager from '../components/admin/RsvpDataManager';
import HomePageManager from '../components/admin/HomePageManager';
import GroupsManager from '../components/admin/GroupsManager';

// Placeholder components for other sections
// Removed Groups placeholder

function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('rsvp-fields');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const tokenResult = await authUser.getIdTokenResult();
        setIsAdmin(tokenResult?.claims?.admin === true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoadingAuth(false); // Set loading to false after check
    });

    return () => unsubscribe(); // Unsubscribe on unmount
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login failed:", error.code, error.message);
      setLoginError(`Login failed: ${error.message}`); // Use static text
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Session timeout logic (placeholder)
  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        signOut(auth);
        alert('Your session has timed out. Please log in again.'); // Use static text
      }, 60 * 60 * 1000); // 60 minutes
    };

    const activityListener = () => resetTimer();

    if (user && isAdmin) {
      resetTimer();
      window.addEventListener('mousemove', activityListener);
      window.addEventListener('keypress', activityListener);
    }

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', activityListener);
      window.removeEventListener('keypress', activityListener);
    };
  }, [user, isAdmin]); // Removed t from dependency array

  // Show loading indicator while checking auth
  if (isLoadingAuth) {
    // You can replace this with a more sophisticated spinner component
    return <div className="container text-center mt-5"><p>Loading Admin Access...</p></div>;
  }

  // If not loading and not logged in, show login modal
  if (!user) {
    return (
      <Modal show={true} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Admin Login Required</Modal.Title> {/* Static text */}
        </Modal.Header>
        <Modal.Body>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label> {/* Static text */}
              <Form.Control type="email" placeholder="Enter email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /> {/* Static text */}
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label> {/* Static text */}
              <Form.Control type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required /> {/* Static text */}
            </Form.Group>
            <Button variant="primary" type="submit">
              Login {/* Static text */}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <h2>Unauthorized Access</h2>
          <p className="lead">You are logged in, but do not have permission to view this page.</p>
          <Button variant="warning" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    );
  }

  return (
    // Remove the flexbox styles from this container, let App.jsx handle it
    <div className="container-fluid py-4"> {/* Add padding */}
      <h1>Admin Dashboard</h1> {/* Static text */}
      <p>Welcome to the admin page! <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button></p> {/* Static text, styled button */}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="adminTab" className="mb-3">
        <Tab eventKey="rsvp-fields" title="RSVP Fields"> {/* Static text */}
          <RsvpFieldsManager /> {/* Use the imported component */}
        </Tab>
        <Tab eventKey="rooms" title="Rooms"> {/* Static text */}
          <RoomsManager /> {/* Use the imported component */}
        </Tab>
        <Tab eventKey="rsvp-data" title="RSVP Data"> {/* Static text */}
          <RsvpDataManager /> {/* Use the imported component */}
        </Tab>
         <Tab eventKey="groups" title="Groups"> {/* Static text */}
          <GroupsManager /> {/* Use the imported component */}
        </Tab>
        <Tab eventKey="home-page" title="Home Page">
          <HomePageManager />
        </Tab>
      </Tabs>
    </div>
  );
}

export default AdminPage;
