const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.setGroupPhoto = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const groupID = data.groupID;
    const groupPhotoUrl = data.url;
    db.ref("Users/"+uid).once("value").then((snapshot)=>{
        const user = snapshot.val();
        const fromName = user.username;
        db.ref("Groups/"+groupID+"/messages").push({
            type:"notification",
            fromName:fromName,
            from:uid,
            fromUrl:"",
            content: fromName+" changed the group photo.",
            time:helper.getDateString(),
        })
    })
    return db.ref("Groups/"+groupID).update({
        photo:groupPhotoUrl,
    })
})