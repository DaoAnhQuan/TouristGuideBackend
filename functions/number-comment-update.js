const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.numberCommentUpdate = functions.database.ref("Posts/{postID}/comments").onWrite((change,context)=>{
    const postID = context.params.postID;
    if (!change.after.exists()){
        db.ref("Posts/"+postID).once("value").then((snap)=>{
            if (snap.exists()){
                db.ref("Posts/"+postID).update({
                    noComment:0
                })
            }
        })
    }else{
        const comments = change.after.val();
        db.ref("Posts/"+postID).update({
            noComment:Object.keys(comments).length
        })
    }
})