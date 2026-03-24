// ==========================================
// 🚍 SchoolSphere Driver GPS (ULTIMATE PRO UPDATED)
// ==========================================

import { db } from "./firebase.js";
import { doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🛡️ 0. Session Data (Login से मिली जानकारी)
const sID = localStorage.getItem("activeSchoolID") || "demoSchool";
const busID = localStorage.getItem("userMobile") || "BUS001"; // ड्राइवर का मोबाइल ही बस ID है

let watchId = null;
let wakeLock = null;

// 🚀 START GPS DUTY
window.startDuty = async function(){

    if(!navigator.geolocation) return alert("❌ आपके फोन में GPS काम नहीं कर रहा!");
    if(!navigator.onLine) return alert("📡 इंटरनेट बंद है! सिग्नल चेक करें।");
    if(watchId !== null) return alert("⚠️ Duty पहले से चालू है!");

    const statusEl = document.getElementById("status");

    // 📱 स्क्रीन को हमेशा चालू रखें (WakeLock API)
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("WakeLock: स्क्रीन अब बंद नहीं होगी ✅");
        }
    } catch (err) { console.log("WakeLock Error:", err); }

    watchId = navigator.geolocation.watchPosition(
        async function(position){

            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let heading = position.coords.heading || 0; 
            
            // 🏎️ Speed Logic: m/s to KM/H
            let speedMS = position.coords.speed || 0;
            let speedKMH = Math.round(speedMS * 3.6); 

            // 🧭 दिशा का नाम (N, S, E, W)
            const directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
            let dirName = directions[Math.round(heading / 45) % 8] || "Moving";

            if(statusEl) {
                statusEl.innerHTML = `
                    <div style="background:#1a1c2c; color:#ffd700; padding:15px; border-radius:15px;">
                        <h1 style="margin:0; font-size:40px;">${speedKMH} <small style="font-size:15px;">KM/H</small></h1>
                        <p style="margin:5px 0 0; color:#fff;">दिशा: ${dirName} | सिग्नल: ✅</p>
                    </div>`;
            }

            try{
                // 🔥 Firebase Live Update (Smart Pathing Plus)
                // अब यह Schools/ID/Buses/Mobile वाले फोल्डर में डेटा डालेगा
                const busDoc = doc(db, `Schools/${sID}/Buses`, busID);
                
                await updateDoc(busDoc, {
                    "liveLocation": {
                        lat: lat,
                        lng: lng,
                        speed: speedKMH,
                        heading: heading,
                        dirName: dirName,
                        status: "online",
                        lastUpdated: Date.now()
                    }
                });

            }catch(e){ 
                console.error("Firebase Sync Error:", e);
                // अगर पहली बार डेटा डाल रहे हैं तो setDoc इस्तेमाल करें
                setDoc(doc(db, `Schools/${sID}/Buses`, busID), { liveLocation: { lat, lng } }, { merge: true });
            }

        },
        function(error){
            let msg = "Location Error: ";
            if(error.code == 1) msg += "GPS Allow करें!";
            else if(error.code == 3) msg += "सिग्नल बहुत कमजोर है!";
            alert(msg);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000 
        }
    );
};

// 🛑 STOP GPS DUTY
window.stopDuty = async function(){
    if(watchId !== null){
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (wakeLock !== null) {
        wakeLock.release().then(() => { wakeLock = null; });
    }

    try {
        // ऑफलाइन स्टेटस अपडेट करें
        const busDoc = doc(db, `Schools/${sID}/Buses`, busID);
        await updateDoc(busDoc, { "liveLocation.status": "offline" });
    } catch(e) {}

    const statusEl = document.getElementById("status");
    if(statusEl) statusEl.innerHTML = `<b style="color:#e74c3c;">⛔ Duty बंद कर दी गई है</b>`;
    
    if(navigator.vibrate) navigator.vibrate(200); // फोन वाइब्रेट होगा
};
