import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.login = async function () {

let mobile = document.getElementById("mobile").value;
let password = document.getElementById("password").value;

try {

let email = mobile + "@schoolsphere.com";

const userCredential = await signInWithEmailAndPassword(auth, email, password);

const uid = userCredential.user.uid;

// Get Role
const docRef = doc(db, "users", uid);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {

let role = docSnap.data().role;

if(role === "principal"){
window.location.href = "principal.html";
}

if(role === "teacher"){
window.location.href = "teacher.html";
}

if(role === "driver"){
window.location.href = "driver.html";
}

if(role === "parent"){
window.location.href = "parent.html";
}

}

} catch (error) {

alert("Login Failed : " + error.message);

}

}
