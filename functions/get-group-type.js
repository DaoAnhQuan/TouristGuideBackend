const functions = require("firebase-functions");
const admin = require('firebase-admin');

const db =admin.database();

exports.getGroupType = functions.https.onCall((data,context)=>{
    const userRef = db.ref("Users/"+context.auth.uid);
    return userRef.once("value")
    .then((value)=>{
        return value.val().group;
    }).then((group)=>{
        const groupRef = db.ref("Groups/"+group);
        return groupRef.once("value");
    }).then((snapshot)=>{
        return {
            "groupID":snapshot.key,
            "type":snapshot.val().type,
        };
    });
})