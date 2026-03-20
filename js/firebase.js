// ==========================================
// 🔥 SchoolSphere Firebase Setup (FINAL)
// ==========================================

// 📦 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStorage } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBSgfU5OhUmLGwc6OBxgrudtZpqMCzgQpw",
  authDomain: "schoolsphere-824ca.firebaseapp.com",
  projectId: "schoolsphere-824ca",
  storageBucket: "schoolsphere-824ca.firebasestorage.app",
  messagingSenderId: "698409232180",
  appId: "1:698409232180:web:schoolsphere"
};


// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);


// 🔑 Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// 💾 Auth Persistence (Auto Login)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Auth Ready"))
  .catch((err) => console.error("❌ Auth Error:", err));


// 📡 Offline Mode
enableIndexedDbPersistence(db)
  .then(() => console.log("✅ Offline Enabled"))
  .catch((err) => console.warn("⚠️ Offline Issue:", err.code));


// 🌐 Network Check
function isOnline(){
  return navigator.onLine;
}


// 📤 Export
export { auth, db, storage, isOnline };
