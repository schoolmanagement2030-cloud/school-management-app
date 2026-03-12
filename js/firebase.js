// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBSgfU5OhUmLGwc6OBxgrudtZpqMCzgQpw",
  authDomain: "schoolsphere-824ca.firebaseapp.com",
  projectId: "schoolsphere-824ca",
  storageBucket: "schoolsphere-824ca.firebasestorage.app",
  messagingSenderId: "698409232180",
  appId: "1:698409232180:web:schoolsphere"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// Export
export { auth, db, storage };
