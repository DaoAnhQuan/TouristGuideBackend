const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.database();

exports.updateUserLocation = functions.https.onCall((data,context)=>{
    const latitude = data.latitude;
    const longitude = data.longitude;
    const uid = context.auth.uid;
    const userRef = db.ref("Users/"+uid);
    userRef.once("value")
    .then((snapshot)=>{
        return snapshot.val().group;
    }).then((group)=>{
        const groupRef = db.ref("Groups/"+group+"/members/"+uid);
        groupRef.update({
            "location":{
                "latitude":latitude,
                "longitude":longitude
            }
        })
    });
})