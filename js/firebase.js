// ==========================================
// 🔥 SchoolSphere Firebase Setup (ULTIMATE PRO)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🚌 रीयल-टाइम ट्रैकिंग के लिए RTDB (Plus)
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBSgfU5OhUmLGwc6OBxgrudtZpqMCzgQpw",
  authDomain: "schoolsphere-824ca.firebaseapp.com",
  databaseURL: "https://schoolsphere-824ca-default-rtdb.firebaseio.com/", // RTDB URL (Plus)
  projectId: "schoolsphere-824ca",
  storageBucket: "schoolsphere-824ca.firebasestorage.app",
  messagingSenderId: "698409232180",
  appId: "1:698409232180:web:schoolsphere"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔑 Core Services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); // बस ट्रैकिंग के लिए (Plus)
const storage = getStorage(app);

// 💾 Auto-Login Persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("🔐 Auth Persistence: Active"))
  .catch((err) => console.error("❌ Auth Error:", err));

// 📡 Offline Sync (Firestore)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn("⚠️ Multiple tabs open, offline disabled.");
    } else if (err.code == 'unimplemented') {
      console.warn("⚠️ Browser doesn't support offline storage.");
    }
  });
}

// 🌐 Smart Network Monitor (Plus)
window.addEventListener('online', () => {
    console.log("🌐 Back Online!");
    // यहाँ आप डेटा सिंक करने का फंक्शन डाल सकते हैं
});

window.addEventListener('offline', () => {
    console.warn("📡 Running in Offline Mode...");
});

// 📤 Exports
export { auth, db, rtdb, storage, onAuthStateChanged };
