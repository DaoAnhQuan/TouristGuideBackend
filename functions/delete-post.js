const admin = require("firebase-admin");
const functions = require("firebase-functions");

const db = admin.database();

exports.deletePost = functions.https.onCall((data,context)=>{
    const postID = data.postID;
    return db.ref("Posts/"+postID).remove();
})