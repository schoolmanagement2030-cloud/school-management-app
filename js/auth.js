import { auth, db } from "./firebase.js";

import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { doc, getDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


window.login = async function () {

let mobile = document.getElementById("mobile").value.trim();
let password = document.getElementById("password").value.trim();

if(mobile === "" || password === ""){
alert("Enter Mobile and Password");
return;
}

// Mobile → Email convert
let email = mobile + "@schoolsphere.com";

try {

const userCredential = await signInWithEmailAndPassword(auth, email, password);

const uid = userCredential.user.uid;

// Firestore user
const docRef = doc(db, "users", uid);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {

let data = docSnap.data();
let role = data.role;

// Device Lock System
let device = navigator.userAgent;

if(data.device && data.device !== device){

alert("This account is locked to another device. Contact Principal.");
return;

}

// Save device if first login
if(!data.device){
await updateDoc(docRef,{
device: device
});
}

// Redirect by role
if(role === "principal"){
window.location.href = "principal.html";
}

else if(role === "teacher"){
window.location.href = "teacher.html";
}

else if(role === "driver"){
window.location.href = "driver.html";
}

else if(role === "parent"){
window.location.href = "parent.html";
}

else{
alert("User role not found");
}

}else{

alert("User data not found");

}

} catch (error) {

alert("Login Failed : " + error.message);

}

}
