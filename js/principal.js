// ==========================================
// 👑 SchoolSphere Principal Panel (PRO UPDATED + PLUS FEATURES)
// ==========================================

import { db, auth } from "./firebase.js";
import { 
    doc, 
    updateDoc, 
    getDoc, 
    setDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✨ [PLUS] 1. Global Success System (यूनिवर्सल मैसेज)
window.showSuccess = function(message) {
    const toast = document.createElement("div");
    toast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #2ecc71; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 9999; font-weight: bold; animation: slideIn 0.5s ease-out;">
            ✅ ${message} Successful!
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// ✨ [PLUS] 2. Copy to Clipboard Function (कॉपी बटन लॉजिक)
window.copyToClipboard = function(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess(label + " Copy");
    });
};

// ✨ [PLUS] 3. Registration Success Display (आईडी दिखाने वाला सुंदर बॉक्स)
window.showRegistrationDetails = function(data) {
    const modal = document.createElement("div");
    modal.style = "position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;";
    
    let detailsHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; width: 100%; max-width: 400px; text-align: center;">
            <h2 style="color: #2ecc71;">🎉 Registration Successful!</h2>
            <hr>
            <div style="text-align: left; margin: 20px 0; font-family: monospace; background: #f9f9f9; padding: 15px; border-radius: 10px;">
                <p><b>Owner ID:</b> ${data.ownerID} <button onclick="copyToClipboard('${data.ownerID}', 'Owner ID')" style="float:right; border:none; background:none; cursor:pointer;">📋</button></p>
                <p><b>School ID:</b> ${data.schoolID} <button onclick="copyToClipboard('${data.schoolID}', 'School ID')" style="float:right; border:none; background:none; cursor:pointer;">📋</button></p>
                ${data.loginID ? `<p><b>Login ID:</b> ${data.loginID} <button onclick="copyToClipboard('${data.loginID}', 'Login ID')" style="float:right; border:none; background:none; cursor:pointer;">📋</button></p>` : ''}
                ${data.password ? `<p><b>Password:</b> ${data.password} <button onclick="copyToClipboard('${data.password}', 'Password')" style="float:right; border:none; background:none; cursor:pointer;">📋</button></p>` : ''}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #ff4757; color: white; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
        </div>
    `;
    modal.innerHTML = detailsHTML;
    document.body.appendChild(modal);
};

// 🛡️ 1. Auth & Real-time Status Check (Plus Logic)
async function checkAuth() {
    const sID = localStorage.getItem("activeSchoolID") || "demoSchool";
    const pUID = localStorage.getItem("principalUID");

    if (!pUID) {
        window.location.href = "login.html";
        return;
    }

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
        // [PLUS] स्कूल सेलेक्ट करने के बाद उसका नाम यहाँ सेट होगा
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

            await setDoc(doc(db, `Schools/${sID}/Logs`, `LOG-${Date.now()}`), {
                action: `Teacher ${actionText}`,
                target: tMobile,
                by: "Principal",
                time: Date.now()
            });

            showSuccess("Status Update"); // [PLUS] Successful Message
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
            showSuccess("School Suspend"); // [PLUS] Successful Message
            setTimeout(logout, 2000);
        } catch (e) { alert("Error: " + e.message); }
    }
};

// 🚪 5. Logout (Clean & Secure)
window.logout = async function() {
    try {
        await auth.signOut();
        localStorage.clear();
        showSuccess("Logout"); // [PLUS] Successful Message
        setTimeout(() => { window.location.href = "login.html"; }, 1000);
    } catch (e) { console.log("Logout Failed"); }
};

// 🚀 6. Quick Navigation
window.go = function(page) {
    window.location.href = page + ".html";
};

// Start
window.onload = checkAuth;

// CSS for Animation (बटन्स और मैसेज के लिए)
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;
document.head.appendChild(style);
