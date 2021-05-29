const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.addComment = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const postID = data.postID;
    const type = data.type;
    const content = data.content;
    return db.ref("Users/"+uid).once("value").then((snap)=>{
        const user = snap.val();
        const fromName = user.username;
        let fromUrl = "";
        if (user.avatar){
            fromUrl = user.avatar.url;
        }
        return db.ref("Posts/"+postID).once("value").then((snap)=>{
            if (snap.exists()){
                db.ref("Posts/"+postID+"/comments").push({
                    type:type,
                    content:content,
                    fromName:fromName,
                    fromUrl:fromUrl,
                    time:helper.getDateString()
                });
                return "success";
            }else{
                return "fail";
            }
        })
    })
})