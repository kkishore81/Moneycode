import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// IMPORTANT: The Firebase configuration below uses placeholder values.
// The original code used environment variables which may not be available in this preview environment,
// causing the app to crash. These placeholders allow the app to load.
// To connect to a real Firebase backend, these values must be replaced with your
// actual Firebase project's credentials.
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);