// ==========================================
// 🚀 SchoolSphere AUTH SYSTEM (FINAL PRO MAX)
// ==========================================

import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🚀 LOGIN FUNCTION
window.login = async function () {

    let mobile = document.getElementById("mobile").value.trim();
    let password = document.getElementById("password").value.trim();

    mobile = mobile.replace(/\D/g, "");

    if(!mobile || !password){
        alert("कृपया मोबाइल और पासवर्ड डालें!");
        return;
    }

    // ⭐ MASTER ADMIN
    if(mobile === "9999999999" && password === "master123") {
        localStorage.setItem("role", "master");
        localStorage.setItem("uid", "MASTER_ADMIN");
        localStorage.setItem("loginTime", Date.now());
        window.location.href = "master_admin.html";
        return;
    }

    let email = mobile + "@schoolsphere.com";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("यूजर डेटा नहीं मिला!");
            return;
        }

        const data = userSnap.data();
        const schoolID = data.schoolID;

        // 🏫 School Block Check
        if(schoolID){
            const schoolRef = doc(db, "schools", schoolID);
            const schoolSnap = await getDoc(schoolRef);

            if (schoolSnap.exists() && schoolSnap.data().status === "blocked") {
                alert("🚫 यह स्कूल ब्लॉक है!");
                return;
            }
        }

        // 🛑 User Block
        if(data.status === "blocked"){
            alert("🚫 आपकी ID ब्लॉक है!");
            return;
        }

        // 📱 Device Lock
        let device = navigator.userAgent + "|" + navigator.language;

        if(data.device && data.device !== device){
            alert("⚠️ यह अकाउंट दूसरे डिवाइस में चल रहा है!");
            return;
        }

        if(!data.device){
            await updateDoc(userRef, { device: device });
        }

        // 💾 SESSION SAVE
        localStorage.setItem("uid", uid);
        localStorage.setItem("role", data.role);
        localStorage.setItem("schoolID", schoolID || "");
        localStorage.setItem("loginTime", Date.now());
        localStorage.setItem("teacherMobile", mobile);

        // 🚀 REDIRECT
        redirectUser(data.role);

    } catch (error) {
        handleAuthErrors(error);
    }
};

// ==========================================
// 🔀 REDIRECT SYSTEM (FULL ROLES)
// ==========================================
function redirectUser(role){
    const routes = {
        "owner": "owner.html",
        "principal": "principal.html",
        "teacher": "teacher.html",
        "driver": "driver.html",
        "parent": "parent.html",
        "student": "student.html",
        "master": "master_admin.html"
    };

    if(routes[role]){
        window.location.href = routes[role];
    } else {
        alert("Role नहीं मिला!");
    }
}

// ==========================================
// 🔐 SESSION SECURITY
// ==========================================
window.checkSession = function(allowedRole){

    const uid = localStorage.getItem("uid");
    const role = localStorage.getItem("role");
    const loginTime = localStorage.getItem("loginTime");

    if(!uid || !role){
        window.location.href = "login.html";
        return;
    }

    // ⏳ 12 घंटे expiry
    const now = Date.now();
    const diff = now - loginTime;

    if(diff > 12 * 60 * 60 * 1000){
        localStorage.clear();
        alert("Session expire, फिर login करें");
        window.location.href = "login.html";
        return;
    }

    if(allowedRole && role !== allowedRole){
        alert("Access Denied!");
        window.location.href = "login.html";
    }
};

// ==========================================
// 🔓 LOGOUT
// ==========================================
window.logout = function(){
    localStorage.clear();
    window.location.href = "login.html";
};

// ==========================================
// ❌ ERROR HANDLING
// ==========================================
function handleAuthErrors(error){
    console.error("Auth Error:", error.code);

    if(error.code === "auth/user-not-found" || error.code === "auth/invalid-credential"){
        alert("मोबाइल या पासवर्ड गलत है!");
    }
    else if(error.code === "auth/too-many-requests"){
        alert("बहुत ज्यादा कोशिश! बाद में ट्राय करें");
    }
    else {
        alert("Login Error: " + error.message);
    }
}
