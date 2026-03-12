// Firebase Config

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "schoolsphere-824ca.firebaseapp.com",
  projectId: "schoolsphere-824ca",
  storageBucket: "schoolsphere-824ca.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
