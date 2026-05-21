// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVj9cKpgfyVlvvvVocQXv58vVDmpKC05E",
  authDomain: "level-up-54a77.firebaseapp.com",
  projectId: "level-up-54a77",
  storageBucket: "level-up-54a77.firebasestorage.app",
  messagingSenderId: "301959969569",
  appId: "1:301959969569:web:f27bb745c980b5f6abdc60",
  measurementId: "G-539996ZN4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
