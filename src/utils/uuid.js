// Simple UUID v4 generator that works in all browsers
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Alternative simple ID generator for shorter IDs
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
