import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Form, Button, Container, Alert } from 'react-bootstrap';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult?.claims?.admin) {
            navigate('/admin'); // Redirect admin
          } else {
            navigate('/'); // Redirect non-admin
          }
        } catch (err) {
          console.error("Error getting token result:", err);
          navigate('/'); // Default redirect on error
        }
      }
      // If no user, stay on login page
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Redirection is handled by the useEffect hook based on auth state change
      console.log('Login successful, waiting for redirect...');
      // No explicit navigate here, let the effect handle it
    } catch (err) {
      console.error("Login failed:", err);
      setError('Failed to log in. Please check your credentials.'); // Generic error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container mt-5" style={{ maxWidth: '400px' }}>
      <Form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </Container>
  );
}

export default LoginPage;
