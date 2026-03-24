// ==========================================
// 🚌 SchoolSphere Bus Tracking (FINAL PRO UPDATED)
// ==========================================
import { db } from "./firebase.js";
import { 
    doc, 
    onSnapshot, 
    setDoc,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🛡️ 0. Session Check (Multi-Owner Plus)
const sID = localStorage.getItem("activeSchoolID") || "demoSchool";
const busID = localStorage.getItem("selectedBusID") || "BUS001";

// 🗺️ 1. Map Setup (Default Center)
var map = L.map('map', { zoomControl: false }).setView([26.8467, 80.9462], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'SchoolSphere Live'
}).addTo(map);

// 📍 Custom Bus Icon (Plus)
var busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // या आपकी अपनी इमेज
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

var marker = L.marker([26.8467, 80.9462], { icon: busIcon }).addTo(map);
var polyline = L.polyline([], { color: '#1a1c2c', weight: 5 }).addTo(map);

// ==========================================
// 📊 Tracking Variables
// ==========================================
let totalDistance = 0;
let lastLatLng = null;
const BUS_AVERAGE = 5; // 5 km/l (डीजल का हिसाब)

// 📅 Daily Reset Logic (Plus)
const todayKey = new Date().toLocaleDateString();
if(localStorage.getItem("last_track_date") !== todayKey){
    localStorage.setItem("last_track_date", todayKey);
    localStorage.setItem("bus_km", "0");
    totalDistance = 0;
} else {
    totalDistance = parseFloat(localStorage.getItem("bus_km")) || 0;
}

// ==========================================
// 🔥 Firebase Live Listener (Cloud Sync Plus)
// ==========================================
// अब यह Schools/ID/Buses/BusID वाले पाथ से डेटा उठाएगा
const busRef = doc(db, `Schools/${sID}/Buses`, busID);

onSnapshot(busRef, async (docSnap) => {
    if (!docSnap.exists()) {
        console.log("Waiting for Bus Signal...");
        return;
    }

    const data = docSnap.data();
    // ड्राइवर ऐप से 'liveLocation' ऑब्जेक्ट के अंदर डेटा आएगा
    if(!data.liveLocation || !data.liveLocation.lat) return;

    let lat = data.liveLocation.lat;
    let lng = data.liveLocation.lng;
    let currentLatLng = L.latLng(lat, lng);

    // ======================================
    // 📏 Distance & Fuel Logic
    // ======================================
    if (lastLatLng) {
        let distance = lastLatLng.distanceTo(currentLatLng) / 1000;

        // 🚫 GPS Filter: 30 meter से कम हलचल को शोर (Noise) मानकर छोड़ दें
        if (distance > 0.03 && distance < 1.5) {
            totalDistance += distance;
            localStorage.setItem("bus_km", totalDistance.toFixed(3));
            
            // रास्ते की लाइन (Trail) बनाना
            polyline.addLatLng(currentLatLng);
        }
    }

    lastLatLng = currentLatLng;
    let expectedFuel = totalDistance / BUS_AVERAGE;

    // ======================================
    // 📺 UI Updates (Safe Check)
    // ======================================
    const updateUI = (id, val) => {
        let el = document.getElementById(id);
        if(el) el.innerText = val;
    };

    updateUI("liveKm", totalDistance.toFixed(2) + " KM");
    updateUI("expectedFuel", expectedFuel.toFixed(2) + " Ltr");

    // ======================================
    // 🗺️ Map Movement (Smooth)
    // ======================================
    marker.setLatLng([lat, lng]);
    map.flyTo([lat, lng], 16, { duration: 2, easeLinearity: 0.1 });

    marker.bindPopup(`
        <div style="text-align:center">
            <b>🚌 ${data.name || 'School Bus'}</b><br>
            दूरी: ${totalDistance.toFixed(2)} KM<br>
            डीजल: ${expectedFuel.toFixed(2)} L
        </div>
    `).openPopup();

    // ======================================
    // ☁️ Sync Stats back to Firebase (For Accountant)
    // ======================================
    try {
        await updateDoc(busRef, {
            todayKm: totalDistance.toFixed(2),
            fuelUsed: expectedFuel.toFixed(2),
            lastSync: Date.now()
        });
    } catch(e) {
        console.error("Sync Error:", e);
    }
});

console.log(`🚌 SchoolSphere Tracking Active for School: ${sID}`);
