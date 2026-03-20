// ==========================================
// 🚍 SchoolSphere Driver GPS (ULTIMATE PRO)
// ==========================================

import { db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let watchId = null;
let wakeLock = null; // 📱 स्क्रीन को चालू रखने के लिए

// 🛡️ Device Fingerprint
function getDeviceID(){
    let id = localStorage.getItem("driver_device_id");
    if(!id){
        id = "DRV-" + Math.random().toString(36).substr(2,12).toUpperCase();
        localStorage.setItem("driver_device_id", id);
    }
    return id;
}

// 🚀 START GPS DUTY
window.startDuty = async function(){

    if(!navigator.geolocation) return alert("GPS supported नहीं है!");
    if(!navigator.onLine) return alert("इंटरनेट बंद है! 📡");
    if(watchId !== null) return alert("Duty पहले से चालू है!");

    const deviceID = getDeviceID();

    // 💡 स्क्रीन को स्लीप मोड में जाने से रोकें (WakeLock)
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) { console.log("WakeLock Error:", err); }

    watchId = navigator.geolocation.watchPosition(
        async function(position){

            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let heading = position.coords.heading || 0; // बस की दिशा (Degrees)
            
            // 🏎️ Speed: m/s को KM/H में बदलें
            let speedMS = position.coords.speed || 0;
            let speedKMH = Math.round(speedMS * 3.6); 

            console.log(`Tracking: ${lat}, ${lng} | Speed: ${speedKMH} KM/H`);

            try{
                // 🔥 Firebase Live Update (One common path for all users)
                await setDoc(doc(db,"bus","location"),{
                    lat: lat,
                    lng: lng,
                    speed: speedKMH,
                    heading: heading,
                    deviceID: deviceID,
                    status: "online",
                    lastUpdated: Date.now()
                }, { merge: true });

                const statusEl = document.getElementById("status");
                if(statusEl) statusEl.innerHTML = `<b style="color:#2ecc71;">🚍 लाइव ट्रैकिंग चालू है (${speedKMH} KM/H)</b>`;

            }catch(e){ console.error("Firebase Sync Error:", e); }

        },
        function(error){
            let msg = "Location Error: ";
            if(error.code == 1) msg += "Permission Denied (GPS Allow करें)";
            else if(error.code == 3) msg += "Timeout (सिग्नल कमजोर है)";
            else msg += error.message;
            alert(msg);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000 // 10 सेकंड का बफर
        }
    );
};

// 🛑 STOP GPS DUTY
window.stopDuty = async function(){

    if(watchId !== null){
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    // स्क्रीन लॉक छोड़ें
    if (wakeLock !== null) {
        wakeLock.release().then(() => { wakeLock = null; });
    }

    // Firebase को बताएं कि बस अब ऑफलाइन है
    try {
        await setDoc(doc(db,"bus","location"), { status: "offline" }, { merge: true });
    } catch(e) {}

    const statusEl = document.getElementById("status");
    if(statusEl) statusEl.innerHTML = `<b style="color:#e74c3c;">⛔ Duty बंद है</b>`;
};
