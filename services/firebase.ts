import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config configured to use Environment Variables if available, 
// but falls back to the provided keys for immediate functionality.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCOEacN36Iu5gKOJcqjNCNj_DwNHR0GRaw",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "verilog-8915d.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "verilog-8915d",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "verilog-8915d.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "728575369702",
  appId: process.env.FIREBASE_APP_ID || "1:728575369702:web:6c9f09cd34e44b68833627",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XLBXJV30R1"
};

// Initialize Firebase using the Modular SDK (v9+)
// This matches the imports defined in index.html (firebase/app, firebase/auth, etc.)
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);