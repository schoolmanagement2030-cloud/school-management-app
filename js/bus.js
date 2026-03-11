var map = L.map('map').setView([26.8467, 80.9462], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

maxZoom:19

}).addTo(map);

var marker = L.marker([26.8467,80.9462]).addTo(map);

marker.bindPopup("School Bus").openPopup();
