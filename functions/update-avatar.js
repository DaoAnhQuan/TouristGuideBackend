const helper = require("./helper");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.database();

exports.updateAvatar = functions.https.onCall((data,context)=>{
    const url = data.url;
    const time = helper.getDateString();
    const download = true;
    const uid = context.auth.uid;
    const userRefString = "Users/"+uid;
    const userRef = db.ref(userRefString);

    userRef.update({
        "avatar":{
            "url":url,
            "time":time,
            "download":download
        }
    }); 
})