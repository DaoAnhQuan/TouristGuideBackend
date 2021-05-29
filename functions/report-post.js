const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.reportPost = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const postID = data.postID;
    let res = {};
    res[uid] = uid;
    return db.ref("Posts/"+postID).once("value").then((snap)=>{
        if (snap.exists()){
            return db.ref("Posts/"+postID+"/reports").update(res);
        }
    })
})