// ==========================================
// 🚌 SchoolSphere Bus Tracking (FINAL PRO)
// ==========================================

import { db } from "./firebase.js";

import { 
    doc, 
    onSnapshot, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🗺️ 1. Map Setup (Default: Lucknow)
var map = L.map('map').setView([26.8467, 80.9462], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// 📍 Bus Marker
var marker = L.marker([26.8467, 80.9462]).addTo(map);

// ==========================================
// 📊 Tracking Variables
// ==========================================

let totalDistance = 0;
let lastLatLng = null;
let busAverage = 5; // km/l

// 📅 Daily Reset Key
const todayKey = new Date().toDateString();

// Local Storage से load (app reload पर भी save रहे)
if(localStorage.getItem("bus_date") === todayKey){
    totalDistance = parseFloat(localStorage.getItem("bus_km")) || 0;
}else{
    localStorage.setItem("bus_date", todayKey);
    localStorage.setItem("bus_km", 0);
}

// ==========================================
// 🔥 Firebase Live Listener
// ==========================================

const busRef = doc(db, "bus", "location");

onSnapshot(busRef, async (docSnap) => {

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    if(!data.lat || !data.lng) return;

    let lat = data.lat;
    let lng = data.lng;

    let currentLatLng = L.latLng(lat, lng);

    // ======================================
    // 📏 Distance Calculation (Accurate)
    // ======================================

    if (lastLatLng) {

        let distance = lastLatLng.distanceTo(currentLatLng) / 1000;

        // 🚫 GPS Noise Filter (50 meter से कम ignore)
        if (distance > 0.05 && distance < 2) {
            totalDistance += distance;

            // 💾 Save locally
            localStorage.setItem("bus_km", totalDistance);
        }
    }

    lastLatLng = currentLatLng;

    // ⛽ Fuel Calculation
    let expectedFuel = totalDistance / busAverage;

    // ======================================
    // 📺 UI Update
    // ======================================

    if(document.getElementById("liveKm")){
        document.getElementById("liveKm").innerText = totalDistance.toFixed(2) + " KM";
    }

    if(document.getElementById("expectedFuel")){
        document.getElementById("expectedFuel").innerText = expectedFuel.toFixed(2) + " L";
    }

    // ======================================
    // 🗺️ Map Update (Smooth)
    // ======================================

    marker.setLatLng([lat, lng]);

    map.flyTo([lat, lng], 15, {
        duration: 1.5
    });

    marker.setPopupContent(`
        <b>🚌 Bus Live</b><br>
        Distance: ${totalDistance.toFixed(2)} KM<br>
        Fuel: ${expectedFuel.toFixed(2)} L
    `);

    // ======================================
    // ☁️ Firebase Sync (Optional but Powerful)
    // ======================================

    await setDoc(doc(db, "bus", "stats"), {
        totalKM: totalDistance,
        fuelUsed: expectedFuel,
        lastUpdated: Date.now()
    });

});

console.log("🚌 Bus Tracking Started Successfully...");
