// ==========================================
// 👑 SchoolSphere Principal Panel (PRO UPDATED)
// ==========================================

import { db, auth } from "./firebase.js";
import { 
    doc, 
    updateDoc, 
    getDoc, 
    setDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🛡️ 1. Auth & Real-time Status Check (Plus Logic)
async function checkAuth() {
    const sID = localStorage.getItem("activeSchoolID") || "demoSchool";
    const pUID = localStorage.getItem("principalUID");

    if (!pUID) {
        window.location.href = "login.html";
        return;
    }

    // 📡 रीयल-टाइम चेक: अगर ओनर ने प्रिंसिपल को ब्लॉक किया, तो तुरंत बाहर निकालो
    const pRef = doc(db, `Schools/${sID}/Principals`, pUID);
    onSnapshot(pRef, (snap) => {
        if (!snap.exists() || snap.data().status === "blocked") {
            alert("⚠️ आपकी एक्सेस ब्लॉक कर दी गई है!");
            logout();
        }
    });

    loadSchoolBranding(sID);
}

// 🏫 2. Load School Branding (Branding Plus)
async function loadSchoolBranding(sID) {
    const sRef = doc(db, "Schools", sID);
    const sSnap = await getDoc(sRef);
    if (sSnap.exists()) {
        const data = sSnap.data();
        const nameEl = document.getElementById("displaySchoolName");
        if(nameEl) nameEl.innerText = data.schoolName || "Principal Panel";
    }
}

// 👨‍🏫 3. Block/Unblock Teacher (With Logging Plus)
window.toggleTeacherStatus = async function(tMobile, newStatus) {
    const sID = localStorage.getItem("activeSchoolID");
    const actionText = newStatus === "blocked" ? "ब्लॉक" : "एक्टिव";

    if (confirm(`क्या आप टीचर (${tMobile}) को ${actionText} करना चाहते हैं?`)) {
        try {
            const tRef = doc(db, `Schools/${sID}/Teachers`, tMobile);
            await updateDoc(tRef, { status: newStatus });

            // 📝 Log Entry: रिकॉर्ड रखना जरूरी है
            await setDoc(doc(db, `Schools/${sID}/Logs`, `LOG-${Date.now()}`), {
                action: `Teacher ${actionText}`,
                target: tMobile,
                by: "Principal",
                time: Date.now()
            });

            alert(`टीचर स्टेटस अपडेट कर दिया गया: ${actionText} 🚀`);
        } catch (e) { alert("Error: " + e.message); }
    }
};

// 🛑 4. Full School Suspend (The Master Power)
window.suspendSchool = async function() {
    const sID = localStorage.getItem("activeSchoolID");
    const sName = localStorage.getItem("schoolName");

    let val = prompt(`⚠️ चेतावनी: ${sName} को ब्लॉक करने के लिए 'CONFIRM' लिखें:`);
    
    if (val === "CONFIRM") {
        try {
            const sRef = doc(db, "Schools", sID);
            await updateDoc(sRef, { 
                status: "blocked",
                suspendedAt: Date.now() 
            });
            alert("पूरा स्कूल सस्पेंड कर दिया गया है! 🛑");
            logout();
        } catch (e) { alert("Error: " + e.message); }
    }
};

// 🚪 5. Logout (Clean & Secure)
window.logout = async function() {
    try {
        await auth.signOut();
        localStorage.clear();
        window.location.href = "login.html";
    } catch (e) { console.log("Logout Failed"); }
};

// 🚀 6. Quick Navigation
window.go = function(page) {
    window.location.href = page + ".html";
};

// Start
window.onload = checkAuth;
