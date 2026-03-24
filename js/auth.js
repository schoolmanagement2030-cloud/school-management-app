// ==========================================
// 🚀 SchoolSphere AUTH SYSTEM (ULTIMATE PRO MAX)
// ==========================================

import { auth, db } from "./firebase.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔄 1. AUTO-REDIRECT (अगर पहले से लॉग-इन है)
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname;
    if (user && (currentPage.includes("login.html") || currentPage === "/")) {
        const savedRole = localStorage.getItem("role");
        if(savedRole) redirectUser(savedRole);
    }
});

// 🚀 2. LOGIN FUNCTION
window.login = async function () {
    const btn = document.querySelector("button");
    let mobile = document.getElementById("mobile").value.trim();
    let password = document.getElementById("password").value.trim();

    // क्लीनअप मोबाइल नंबर
    mobile = mobile.replace(/\D/g, "");

    if(!mobile || !password){
        alert("❌ कृपया मोबाइल और पासवर्ड डालें!");
        return;
    }

    // बटन को 'Loading' मोड में डालें
    if(btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> थोड़ा रुकिए...';
    }

    // ⭐ MASTER ADMIN (Super Power)
    if(mobile === "9999999999" && password === "master123") {
        saveSession("MASTER_ADMIN", "master", "MASTER_SCHOOL");
        window.location.href = "master_admin.html";
        return;
    }

    // ईमेल फॉर्मूला (मोबाइल को ईमेल की तरह इस्तेमाल करना)
    const email = mobile + "@schoolsphere.com";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // यूजर का डेटा लाना
        const userSnap = await getDoc(doc(db, "users", uid));
        if (!userSnap.exists()) throw new Error("यूजर डेटा डेटाबेस में नहीं मिला!");

        const data = userSnap.data();
        const sID = data.schoolID;

        // 🏫 1. School Status Check (Plus)
        const schoolSnap = await getDoc(doc(db, "Schools", sID));
        if (schoolSnap.exists() && schoolSnap.data().status === "blocked") {
            alert("🚫 यह स्कूल ब्लॉक है! ओनर से संपर्क करें।");
            await signOut(auth);
            location.reload();
            return;
        }

        // 🛑 2. User Block Check
        if(data.status === "blocked"){
            alert("🚫 आपकी आईडी सस्पेंड कर दी गई है!");
            await signOut(auth);
            return;
        }

        // 📱 3. Device Lock Logic (Plus)
        const currentDevice = navigator.userAgent.substring(0, 50); 
        if(data.deviceID && data.deviceID !== currentDevice){
            // विकास भाई, यहाँ आप चाहें तो 'Device Reset' का ऑप्शन भी दे सकते हैं
            alert("⚠️ यह अकाउंट पहले से किसी दूसरे फोन में चल रहा है!");
            await signOut(auth);
            return;
        }

        if(!data.deviceID){
            await updateDoc(doc(db, "users", uid), { deviceID: currentDevice });
        }

        // 💾 4. SESSION SAVE
        saveSession(uid, data.role, sID, mobile);

        // 🚀 5. REDIRECT
        redirectUser(data.role);

    } catch (error) {
        handleAuthErrors(error);
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = 'लॉगिन करें 🚀';
        }
    }
};

// ==========================================
// 🛠️ HELPER FUNCTIONS (The Plus Logic)
// ==========================================

function saveSession(uid, role, sID, mob = "") {
    localStorage.setItem("uid", uid);
    localStorage.setItem("role", role);
    localStorage.setItem("activeSchoolID", sID);
    localStorage.setItem("loginTime", Date.now());
    localStorage.setItem("userMobile", mob);
}

function redirectUser(role){
    const routes = {
        "master": "master_admin.html",
        "owner": "owner.html",
        "principal": "principal.html",
        "teacher": "teacher.html",
        "driver": "driver.html",
        "parent": "parent.html",
        "student": "student.html"
    };
    if(routes[role]) window.location.href = routes[role];
}

// 🔐 SESSION MONITOR (हर पेज पर चलेगा)
window.checkSession = function(allowedRole){
    const uid = localStorage.getItem("uid");
    const role = localStorage.getItem("role");
    const loginTime = localStorage.getItem("loginTime");

    if(!uid || !role) {
        window.location.href = "login.html";
        return;
    }

    // 12 घंटे बाद ऑटो लॉग-आउट
    if(Date.now() - loginTime > 12 * 60 * 60 * 1000){
        logout();
        return;
    }

    if(allowedRole && role !== allowedRole){
        document.body.innerHTML = "<h1 style='text-align:center;margin-top:20%'>Access Denied 🚫</h1>";
        setTimeout(() => window.location.href = "login.html", 2000);
    }
};

window.logout = async function(){
    if(confirm("क्या आप बाहर निकलना चाहते हैं?")) {
        await signOut(auth);
        localStorage.clear();
        window.location.href = "login.html";
    }
};

function handleAuthErrors(error){
    const errors = {
        "auth/invalid-credential": "मोबाइल या पासवर्ड गलत है! ❌",
        "auth/user-disabled": "यह अकाउंट बंद कर दिया गया है! 🚫",
        "auth/too-many-requests": "बहुत ज्यादा कोशिशें! थोड़ी देर बाद आएं। ⏳"
    };
    alert(errors[error.code] || "लॉगिन एरर: " + error.message);
}
