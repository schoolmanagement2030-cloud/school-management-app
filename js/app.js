// ==========================================
// 🚀 SchoolSphere - Core Navigation & Auth (PRO PLUS UPDATED)
// ==========================================

// ⏳ SESSION TIME (30 मिनट)
const SESSION_TIME = 30 * 60 * 1000;

// ✨ [PLUS] 1. Universal Success System (मैसेज दिखाने के लिए)
window.showSuccess = function(message) {
    const toast = document.createElement("div");
    toast.className = "success-toast";
    toast.innerHTML = `✅ ${message} Successful!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// ✨ [PLUS] 2. Set Active School (स्कूल चुनने पर नाम बदलने का लॉजिक)
window.selectSchool = function(sID, sName) {
    localStorage.setItem("activeSchoolID", sID);
    localStorage.setItem("activeSchoolName", sName); // स्कूल का नाम स्टोर किया
    showSuccess(sName + " Selected");
    window.location.href = "owner.html"; // या जहाँ आप भेजना चाहें
};

// 🛡️ Auth Check (Page Load पर)
function checkAuth() {
    const schoolID = localStorage.getItem("activeSchoolID");
    const role = localStorage.getItem("role");
    const loginTime = localStorage.getItem("loginTime");
    const activeName = localStorage.getItem("activeSchoolName");

    // ✨ [PLUS] अगर स्कूल सेलेक्ट है, तो AppBar में नाम बदलें
    const displayEl = document.getElementById("displaySchoolName");
    if (displayEl && activeName) {
        displayEl.innerText = activeName;
    }

    if (!schoolID || !role) {
        if (!window.location.href.includes("index.html")) {
            window.location.href = "../html/index.html";
        }
        return;
    }

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
        localStorage.removeItem("teacherMobile");
        localStorage.removeItem("activeSchoolID");
        localStorage.removeItem("activeSchoolName"); // [PLUS] नाम भी हटाओ
        localStorage.removeItem("role");
        localStorage.removeItem("loginTime");

        showSuccess("Logout"); // [PLUS] Use Success Message
        setTimeout(() => {
            window.location.href = "../html/index.html";
        }, 1000);
    }
}

// ✨ [PLUS] 3. Copy Function (For Global Use)
window.copyData = function(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess(label + " Copy");
    });
};

// ==========================================
// 🔄 Auto Run Auth Check
// ==========================================
window.onload = checkAuth;

// 🎨 [PLUS] CSS for Toast & Cards (बगैर HTML बदले सुंदर बनाने के लिए)
const style = document.createElement('style');
style.innerHTML = `
    .success-toast {
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #2ecc71; color: white; padding: 12px 25px;
        border-radius: 50px; font-weight: bold; z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3); animation: pop 0.3s ease;
    }
    @keyframes pop { from { top: -50px; } to { top: 20px; } }
    
    .owner-card {
        background: white; border-radius: 15px; padding: 20px;
        margin: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center; border-left: 5px solid #ff4757;
        cursor: pointer; transition: 0.3s;
    }
    .owner-card:active { transform: scale(0.95); }
`;
document.head.appendChild(style);
