const functions = require("firebase-functions");
const admin = require('firebase-admin');

const db =admin.database();
const helper = require("./helper.js");

exports.addTextMessage = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const text = data.text;
    const groupID = data.groupID;
    return db.ref("Users/"+uid).once("value")
    .then((snap)=>{
        const fromName = snap.val().username;
        let fromUrl = "";
        if (snap.val().avatar){
            fromUrl = snap.val().avatar.url;
        }
        return db.ref("Groups/"+groupID+"/messages").push({
            type: "text",
            content: text,
            from: uid,
            fromName:fromName,
            fromUrl:fromUrl,
            time: helper.getDateString()
        })
    })
})