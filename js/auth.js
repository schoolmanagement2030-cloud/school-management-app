// ==========================================
// 🚀 SchoolSphere AUTH SYSTEM (FINAL PRO)
// ==========================================

import { auth, db } from "./firebase.js";

import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { doc, getDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ⏳ Session Time (30 min)
const SESSION_TIME = 30 * 60 * 1000;

// 🚀 LOGIN FUNCTION
window.login = async function () {

    let mobile = document.getElementById("mobile").value.trim();
    let password = document.getElementById("password").value.trim();

    if(!mobile || !password){
        alert("कृपया मोबाइल और पासवर्ड डालें!");
        return;
    }

    // 📧 Mobile → Email
    let email = mobile.replace(/\s+/g, '') + "@schoolsphere.com";

    try {

        // 🔐 1. Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 📦 2. Firestore User Fetch
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("यूजर डेटा नहीं मिला!");
            return;
        }

        const data = userSnap.data();
        const schoolID = data.schoolID;

        // 🏫 3. School Block Check
        if(schoolID){
            const schoolRef = doc(db, "schools", schoolID);
            const schoolSnap = await getDoc(schoolRef);

            if (schoolSnap.exists() && schoolSnap.data().status === "blocked") {
                alert("🚫 यह स्कूल ब्लॉक है!");
                return;
            }
        }

        // 🛑 4. User Block Check
        if(data.status === "blocked"){
            alert("🚫 आपकी ID ब्लॉक है!");
            return;
        }

        // 📱 5. Device Fingerprint (Better)
        let device = navigator.userAgent + "|" + navigator.language;

        if(data.device && data.device !== device){
            alert("⚠️ यह अकाउंट किसी दूसरे डिवाइस में चल रहा है!");
            return;
        }

        // 📌 First Login → Save Device
        if(!data.device){
            await updateDoc(userRef, { device: device });
        }

        // 💾 6. Save Session
        localStorage.setItem("uid", uid);
        localStorage.setItem("role", data.role);
        localStorage.setItem("schoolID", schoolID || "");
        localStorage.setItem("loginTime", Date.now());
        localStorage.setItem("teacherMobile", mobile);

        // 🚀 7. Redirect
        redirectUser(data.role);

    } catch (error) {
        handleAuthErrors(error);
    }
};

// ==========================================
// 🔀 Redirect System
// ==========================================

function redirectUser(role){

    const routes = {
        "principal": "principal.html",
        "teacher": "teacher.html",
        "driver": "driver.html",
        "parent": "parent.html"
    };

    if(routes[role]){
        window.location.href = routes[role];
    } else {
        alert("Role नहीं मिला!");
    }
}

// ==========================================
// ❌ Error Handling (Smart)
// ==========================================

function handleAuthErrors(error){

    console.error("Auth Error:", error.code);

    if(error.code === "auth/user-not-found" || error.code === "auth/invalid-credential"){
        alert("मोबाइल या पासवर्ड गलत है!");
    }
    else if(error.code === "auth/wrong-password"){
        alert("गलत पासवर्ड!");
    }
    else if(error.code === "auth/too-many-requests"){
        alert("बहुत ज्यादा कोशिश! 5 मिनट बाद ट्राय करें");
    }
    else if(error.code === "auth/network-request-failed"){
        alert("📡 इंटरनेट कनेक्शन चेक करें!");
    }
    else{
        alert("Login Error: " + error.message);
    }
}
