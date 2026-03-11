navigator.geolocation.watchPosition(function(position){

var lat = position.coords.latitude;

var lon = position.coords.longitude;

console.log("Driver Location:",lat,lon);

});
