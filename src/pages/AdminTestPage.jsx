import React from 'react';

function AdminTestPage() {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>Admin Test Page</h1>
      <p>If you can see this, React routing is working!</p>
      <button onClick={() => alert('Button works!')}>
        Test Button
      </button>
      <div style={{marginTop: '20px'}}>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default AdminTestPage;
