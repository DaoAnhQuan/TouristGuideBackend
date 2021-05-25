const functions = require("firebase-functions");
const admin = require('firebase-admin');

const db =admin.database();

exports.getLastLocation = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const groupID = data.groupID;
    return db.ref("Groups/"+groupID).once("value")
        .then((snap)=>{
            const groupInfo = snap.val();
            let lastLocation = false;
            if (groupInfo.lastLocationMessage){
                lastLocation = true;
            }
            if (!lastLocation){
                return {
                    "last location":"false"
                };
            }else{
                const lastLocation = groupInfo.lastLocationMessage;
                return {
                    "last location":"true",
                    "last location from name": lastLocation.fromName,
                    "last location from url":lastLocation.fromUrl,
                    "last location time": lastLocation.time,
                    "last location content":lastLocation.content,
                };
            }
        })
})