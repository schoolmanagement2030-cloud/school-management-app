// Secure Password Hash

async function hashPassword(password){

const encoder = new TextEncoder();
const data = encoder.encode(password);

const hashBuffer = await crypto.subtle.digest("SHA-256", data);

const hashArray = Array.from(new Uint8Array(hashBuffer));

const hashHex = hashArray.map(b => b.toString(16).padStart(2,"0")).join("");

return hashHex;

}


// Login System

async function login(){

let mobile = document.getElementById("mobile").value;
let password = document.getElementById("password").value;

if(mobile === "" || password === ""){
alert("Enter Mobile and Password");
return;
}

let hash = await hashPassword(password);


// Example secure user

let storedMobile = "9999999999";
let storedHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459f8b8e5e8b1e8c2d";


if(mobile === storedMobile && hash === storedHash){

window.location.href = "principal.html";

}else{

alert("Invalid Login");

}

}
