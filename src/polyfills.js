// Enhanced polyfill for crypto.randomUUID for browser compatibility
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Ensure crypto object exists
  if (!window.crypto) {
    window.crypto = {};
  }
  
  // Add randomUUID if it doesn't exist
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
  
  // Also ensure it's available on the global crypto object
  if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    crypto.randomUUID = window.crypto.randomUUID;
  }
})();

// Also provide a fallback if crypto is undefined globally
if (typeof crypto === 'undefined') {
  globalThis.crypto = window.crypto || {
    randomUUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
}
