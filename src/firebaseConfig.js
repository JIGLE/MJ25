// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCiEcAjNMf3pKf0f1OoNReKlklw03TIjko",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wedding-website-37d74.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://wedding-website-37d74-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wedding-website-37d74",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wedding-website-37d74.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app); // Realtime Database
export const storage = getStorage(app); // Firebase Storage

export default app; // Export the initialized app itself if needed elsewhere
