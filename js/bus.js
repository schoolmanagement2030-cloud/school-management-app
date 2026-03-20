// ==========================================
// 🚌 SchoolSphere Bus Tracking (ULTIMATE PRO)
// ==========================================

import { db } from "./firebase.js";
import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🗺️ 1. Map Setup (Default: Lucknow)
var map = L.map('map').setView([26.8467, 80.9462], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// 🚌 Custom Bus Icon (दिखने में प्रोफेशनल)
var busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // बस का आइकन
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

// 📍 Bus Marker
var marker = L.marker([26.8467, 80.9462], { icon: busIcon }).addTo(map);

// ==========================================
// 📊 Tracking Variables
// ==========================================
let totalDistance = 0;
let lastLatLng = null;
let busAverage = 5; // km/l

const todayKey = new Date().toDateString();

// 💾 Local Storage Sync
if(localStorage.getItem("bus_date") === todayKey){
    totalDistance = parseFloat(localStorage.getItem("bus_km")) || 0;
} else {
    localStorage.setItem("bus_date", todayKey);
    localStorage.setItem("bus_km", 0);
    totalDistance = 0;
}

// ==========================================
// 🔥 Firebase Live Listener
// ==========================================
const busRef = doc(db, "bus", "location");

onSnapshot(busRef, async (docSnap) => {
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    if(!data.lat || !data.lng) return;

    const lat = data.lat;
    const lng = data.lng;
    const speed = data.speed || 0; // ड्राइवर के फोन से आने वाली लाइव स्पीड
    const heading = data.heading || 0; // बस की दिशा (Degrees)

    let currentLatLng = L.latLng(lat, lng);

    // ======================================
    // 📏 Distance Calculation (Noise Filtered)
    // ======================================
    if (lastLatLng) {
        let distance = lastLatLng.distanceTo(currentLatLng) / 1000;

        // 🚫 GPS Noise Filter: 0.03 KM (30 मीटर) से कम और 2 KM से ज्यादा को हटाओ
        if (distance > 0.03 && distance < 2) {
            totalDistance += distance;
            localStorage.setItem("bus_km", totalDistance.toFixed(2));
        }
    }

    lastLatLng = currentLatLng;
    let expectedFuel = totalDistance / busAverage;

    // ======================================
    // 📺 UI Updates (Direct DOM manipulation)
    // ======================================
    updateUI("liveKm", totalDistance.toFixed(2) + " KM");
    updateUI("expectedFuel", expectedFuel.toFixed(2) + " L");
    updateUI("liveSpeed", speed + " KM/H");

    // ======================================
    // 🗺️ Map & Marker Update
    // ======================================
    marker.setLatLng([lat, lng]);
    
    // बस को उसकी दिशा के हिसाब से घुमाना (CSS Rotation)
    marker.getElement().style.transform += ` rotate(${heading}deg)`;

    map.flyTo([lat, lng], 16, { duration: 1.2 });

    marker.bindPopup(`
        <div style="text-align:center;">
            <b style="color:#1a1c2c;">🚌 बस लाइव ट्रैक</b><br>
            <hr>
            स्पीड: <b>${speed} KM/H</b><br>
            दूरी: <b>${totalDistance.toFixed(2)} KM</b><br>
            डीजल (अनुमानित): <b>${expectedFuel.toFixed(2)} L</b>
        </div>
    `).openPopup();

    // ======================================
    // ☁️ Sync Stats to Firebase
    // ======================================
    await setDoc(doc(db, "bus", "stats"), {
        totalKM: totalDistance.toFixed(2),
        fuelUsed: expectedFuel.toFixed(2),
        currentSpeed: speed,
        lastUpdated: Date.now()
    }, { merge: true });
});

// Helper Function
function updateUI(id, val) {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
}

console.log("🚌 Bus Tracking System Active...");
