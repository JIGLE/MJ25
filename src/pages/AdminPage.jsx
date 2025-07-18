import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Modal, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import WeddingDashboard from '../components/admin/WeddingDashboard';
import styles from './AdminPage.module.css';

function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Auth management
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
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (isLoadingAuth) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loadingScreen}>Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className={styles.adminContainer}>
        <button onClick={() => setShowLoginModal(true)} className={styles.loginButton}>
          Admin Login
        </button>

        <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Admin Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loginError && <div className={styles.error}>{loginError}</div>}
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Login
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  return <WeddingDashboard />;
}

export default AdminPage;
