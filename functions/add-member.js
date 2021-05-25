const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.addMember = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const members = data.members;
    return db.ref("Users/"+uid).once("value")
        .then((snap)=>{
            const groupID = snap.val().group;
            const fromName = snap.val().username;
            let fromUrl = "";
            if (snap.val().avatar){
                fromUrl = snap.val().avatar.url;
            }
            for (const memberID in members){
                db.ref("Groups/"+groupID+"/members/"+memberID).update({
                    "state":"Pending",
                })
                db.ref("Users/"+memberID+"/notifications").push({
                    "type":"invitation",
                    "content":groupID,
                    "from":uid,
                    "time":helper.getDateString()
                })
                db.ref("Users/"+memberID+"/username").once("value")
                    .then((snap)=>{
                        const memberName = snap.val();
                        db.ref("Groups/"+groupID+"/messages").push({
                            "type":"notification",
                            "content": fromName +" invited "+memberName+" to join the group.",
                            "from":uid,
                            "fromName":fromName,
                            "fromUrl":fromUrl,
                            "time":helper.getDateString()
                        })
                    })
            }
        })
})