// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration (copied from old project)
// TODO: Consider moving sensitive keys to environment variables for production builds
const firebaseConfig = {
  apiKey: "AIzaSyCiEcAjNMf3pKf0f1OoNReKlklw03TIjko", // Replace with your actual API key if different
  authDomain: "wedding-website-37d74.firebaseapp.com",
  databaseURL: "https://wedding-website-37d74-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wedding-website-37d74",
  storageBucket: "wedding-website-37d74.appspot.com",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Optional
  // appId: "YOUR_APP_ID" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app); // Realtime Database
export const storage = getStorage(app); // Firebase Storage

export default app; // Export the initialized app itself if needed elsewhere
