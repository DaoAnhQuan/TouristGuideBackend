const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.likePost = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const postID = data.postID;
    const action = data.action;
    let res = {};
    res[uid] = uid;
    return db.ref("Posts/"+postID).once("value").then((snap)=>{
        if (snap.exists()){
            if (action=="like"){
                return db.ref("Posts/"+postID+"/likes").update(res);
            }else{
                return db.ref("Posts/"+postID+"/likes/"+uid).remove();
            }
        }
    })
})