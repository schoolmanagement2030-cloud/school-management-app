// ==========================================
// 🚀 SchoolSphere - Core Navigation & Auth (FINAL)
// ==========================================

// ⏳ SESSION TIME (30 मिनट)
const SESSION_TIME = 30 * 60 * 1000;

// 🛡️ Auth Check (Page Load पर)
function checkAuth() {

    const schoolID = localStorage.getItem("activeSchoolID");
    const role = localStorage.getItem("role");
    const loginTime = localStorage.getItem("loginTime");

    // ❌ अगर लॉगिन नहीं है
    if (!schoolID || !role) {
        if (!window.location.href.includes("index.html")) {
            window.location.href = "../html/index.html";
        }
        return;
    }

    // ⏳ Session Expiry Check
    if (loginTime && (Date.now() - loginTime > SESSION_TIME)) {
        alert("⏳ Session Expired! Please login again.");
        logout();
    }
}

// ==========================================
// 🏫 Role-Based Navigation
// ==========================================

function principal() {
    setSession("principal");
    window.location.href = "../html/principal.html";
}

function teacher() {
    setSession("teacher");
    window.location.href = "../html/teacher.html";
}

function driver() {
    setSession("driver");
    window.location.href = "../html/driver.html";
}

function parent() {
    setSession("parent");
    window.location.href = "../html/parent.html";
}

function owner() {
    setSession("owner");
    window.location.href = "../html/owner.html";
}

// ==========================================
// 🔐 Session Set Function
// ==========================================

function setSession(userRole){
    localStorage.setItem("role", userRole);
    localStorage.setItem("loginTime", Date.now());
}

// ==========================================
// 🚪 Logout Function
// ==========================================

function logout() {

    if (confirm("क्या आप लॉगआउट करना चाहते हैं?")) {

        // 🔐 Clear Important Data
        localStorage.removeItem("teacherMobile");
        localStorage.removeItem("activeSchoolID");
        localStorage.removeItem("role");
        localStorage.removeItem("loginTime");

        alert("✅ Logged Out Successfully");

        window.location.href = "../html/index.html";
    }
}

// ==========================================
// 🔄 Auto Run Auth Check
// ==========================================

window.onload = checkAuth;
