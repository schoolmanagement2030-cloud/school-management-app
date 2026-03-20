// ==========================================
// 👑 SchoolSphere Principal Panel (PRO)
// ==========================================

import { db, auth } from "./firebase.js";
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🛡️ 1. Auth & Role Check (सुरक्षा सबसे पहले)
async function checkAuth() {
    const uid = localStorage.getItem("uid");
    const role = localStorage.getItem("role");

    if (!uid || role !== "principal") {
        alert("अनधिकृत प्रवेश! कृपया प्रिंसिपल अकाउंट से लॉगिन करें।");
        window.location.href = "index.html";
    }
}

// 👨‍🏫 2. Block Teacher (Direct Firestore Update)
window.blockTeacher = async function(teacherMobile) {
    const schoolID = localStorage.getItem("schoolID");
    if (confirm(`क्या आप टीचर (${teacherMobile}) को ब्लॉक करना चाहते हैं?`)) {
        try {
            const teacherRef = doc(db, "schools", schoolID, "teachers", teacherMobile);
            await updateDoc(teacherRef, { status: "blocked" });
            alert("टीचर को तुरंत ब्लॉक कर दिया गया! 🚫");
        } catch (e) { alert("Error: " + e.message); }
    }
};

// 🟢 3. Unblock Teacher
window.unblockTeacher = async function(teacherMobile) {
    const schoolID = localStorage.getItem("schoolID");
    try {
        const teacherRef = doc(db, "schools", schoolID, "teachers", teacherMobile);
        await updateDoc(teacherRef, { status: "active" });
        alert("टीचर अब एक्टिव है! ✅");
    } catch (e) { alert("Error: " + e.message); }
};

// 🏫 4. Full School Block (Master Control - विकास भाई की पावर)
window.blockSchool = async function() {
    const schoolID = localStorage.getItem("schoolID");
    if (confirm("⚠️ चेतावनी: क्या आप पूरा स्कूल ब्लॉक करना चाहते हैं? कोई भी लॉगिन नहीं कर पाएगा।")) {
        try {
            const schoolRef = doc(db, "schools", schoolID);
            await updateDoc(schoolRef, { status: "blocked" });
            alert("पूरा स्कूल सस्पेंड कर दिया गया है! 🛑");
        } catch (e) { alert("Error: " + e.message); }
    }
};

// 🚀 5. Quick Navigation Functions
window.openModule = function(path) {
    window.location.href = path + ".html";
};

// 🚪 6. Logout (Secure & Clean)
window.logout = async function() {
    if (confirm("क्या आप लॉगआउट करना चाहते हैं?")) {
        try {
            await auth.signOut();
            localStorage.clear(); // सारा पुराना डेटा साफ़ करें
            window.location.href = "index.html";
        } catch (e) { alert("Logout Failed"); }
    }
};

// ऑटो-रन
window.onload = checkAuth;
