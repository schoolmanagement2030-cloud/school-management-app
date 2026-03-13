import { db } from "./firebase.js";

import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let watchId = null;


// Start GPS
window.startDuty = function(){

if(navigator.geolocation){

watchId = navigator.geolocation.watchPosition(async function(position){

let lat = position.coords.latitude;
let lng = position.coords.longitude;

console.log("Driver Location:",lat,lng);

// Firebase update
await setDoc(doc(db,"bus","location"),{

lat: lat,
lng: lng,
time: new Date().toISOString()

});

});

document.getElementById("status").innerText="Duty Started";

}

};


// Stop GPS
window.stopDuty = function(){

if(watchId!==null){

navigator.geolocation.clearWatch(watchId);

}

document.getElementById("status").innerText="Duty Stopped";

};
