const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.numberLikeUpdate = functions.database.ref("Posts/{postID}/likes").onWrite((change,context)=>{
    const postID = context.params.postID;
    if (!change.after.exists()){
        db.ref("Posts/"+postID).once("value").then((snap)=>{
            if (snap.exists()){
                db.ref("Posts/"+postID).update({
                    noLike:0
                })
            }
        })
    }else{
        const likes = change.after.val();
        db.ref("Posts/"+postID).update({
            noLike:Object.keys(likes).length
        })
    }
})