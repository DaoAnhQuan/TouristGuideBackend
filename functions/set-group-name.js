const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.setGroupName = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const groupID = data.groupID;
    const groupName = data.groupName;
    db.ref("Users/"+uid).once("value").then((snapshot)=>{
        const user = snapshot.val();
        const fromName = user.username;
        db.ref("Groups/"+groupID+"/messages").push({
            type:"notification",
            fromName:fromName,
            from:uid,
            fromUrl:"",
            content: fromName+" changed the group name to "+groupName+".",
            time:helper.getDateString()
        })
    })
    return db.ref("Groups/"+groupID).update({
        name:groupName,
    })
})