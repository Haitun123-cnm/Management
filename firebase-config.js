// Firebase configuration for cloud storage
// This enables real-time sync across multiple devices

// Firebase configuration object
const firebaseConfig = {
  // You'll need to replace these with your own Firebase project credentials
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firestore database reference
const db = firebase.firestore();

// Export for use in other files
window.db = db;

