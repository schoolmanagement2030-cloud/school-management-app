async function hashPassword(password){

const encoder = new TextEncoder();
const data = encoder.encode(password);

const hashBuffer = await crypto.subtle.digest("SHA-256", data);

const hashArray = Array.from(new Uint8Array(hashBuffer));

const hashHex = hashArray.map(b => b.toString(16).padStart(2,"0")).join("");

return hashHex;

}



async function login(){

let mobile = document.getElementById("mobile").value;
let password = document.getElementById("password").value;

if(!mobile || !password){
alert("Enter Mobile and Password");
return;
}

let hash = await hashPassword(password);

db.collection("users")
.where("mobile","==",mobile)
.where("passwordHash","==",hash)
.get()
.then((querySnapshot)=>{

if(querySnapshot.empty){

alert("Invalid Login");

return;

}

querySnapshot.forEach((doc)=>{

let user = doc.data();

if(user.role=="principal"){
window.location.href="principal.html";
}

if(user.role=="teacher"){
window.location.href="teacher.html";
}

if(user.role=="driver"){
window.location.href="driver.html";
}

if(user.role=="parent"){
window.location.href="parent.html";
}

})

})

}
