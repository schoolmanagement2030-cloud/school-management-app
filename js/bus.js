import { db } from "./firebase.js";
import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. मैप सेटअप (Default Location: Lucknow)
var map = L.map('map').setView([26.8467, 80.9462], 13);

// फ्री मैप टाइल्स (Leaflet)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// बस का मार्कर
var marker = L.marker([26.8467, 80.9462]).addTo(map);
marker.bindPopup("School Bus - Live").openPopup();

// --- दूरी और डीजल के वेरिएबल्स ---
let totalDistance = 0; // कुल चली गई दूरी (KM)
let lastLatLng = null; // पिछली लोकेशन
let busAverage = 5;    // यहाँ अपनी बस की एवरेज डालें (जैसे 5 km/l)
// -------------------------------

// 2. Firebase से लाइव लोकेशन सुनना
const busRef = doc(db, "bus", "location");

onSnapshot(busRef, (docSnap) => {
    if (docSnap.exists()) {
        let data = docSnap.data();
        let lat = data.lat;
        let lng = data.lng;
        let currentLatLng = L.latLng(lat, lng);

        // --- दूरी नापने का असली लॉजिक ---
        if (lastLatLng) {
            // distanceTo मीटर में दूरी देता है, उसे KM में बदलने के लिए 1000 से भाग दिया
            let d = lastLatLng.distanceTo(currentLatLng) / 1000;

            // अगर दूरी 20 मीटर से ज्यादा है, तभी जोड़ें (ताकि सिग्नल गड़बड़ होने पर फालतू KM न बढ़ें)
            if (d > 0.02) { 
                totalDistance += d;
            }
        }
        lastLatLng = currentLatLng;

        // डीजल का हिसाब (Formula: KM / Average)
        let expectedFuel = totalDistance / busAverage;

        // 3. UI (स्क्रीन) पर डेटा अपडेट करना
        // ये IDs आपकी HTML फाइल में होनी चाहिए (liveKm और expectedFuel)
        if(document.getElementById("liveKm")) {
            document.getElementById("liveKm").innerText = totalDistance.toFixed(2) + " KM";
        }
        if(document.getElementById("expectedFuel")) {
            document.getElementById("expectedFuel").innerText = expectedFuel.toFixed(2) + " Ltr";
        }

        // 4. मैप और मार्कर अपडेट करना
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], 15);
        
        // मार्कर के ऊपर लाइव जानकारी दिखाना
        marker.setPopupContent(`<b>Bus Status</b><br>Today: ${totalDistance.toFixed(2)} KM<br>Fuel: ${expectedFuel.toFixed(2)} L`).openPopup();

        // 5. (Optional) इस दूरी को वापस Firebase में सेव करना ताकि अकाउंटेंट देख सके
        // updateBusStats(totalDistance, expectedFuel);
    }
});

console.log("Bus Tracking Service Started...");
