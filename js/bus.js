import { db } from "./firebase.js";

import { doc, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Map start location
var map = L.map('map').setView([26.8467, 80.9462], 13);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom:19
}).addTo(map);


// Bus Marker
var marker = L.marker([26.8467,80.9462]).addTo(map);

marker.bindPopup("School Bus");


// Firebase location listener
const busRef = doc(db,"bus","location");

onSnapshot(busRef,(docSnap)=>{

if(docSnap.exists()){

let data = docSnap.data();

let lat = data.lat;
let lng = data.lng;

// Move marker
marker.setLatLng([lat,lng]);

// Center map
map.setView([lat,lng],15);

}

});
