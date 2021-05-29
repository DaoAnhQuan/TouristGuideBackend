const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.getPostDetail = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const postID = data.postID;
    let res = {};
    return db.ref("Posts/"+postID).once("value")
    .then((snap)=>{
        if (snap.exists()){
            const post = snap.val();
            res["postID"] = postID;
            res["topic"] = post.topic;
            res["photo"] = post.photo;
            res["title"] = post.title;
            res["description"] = post.description;
            res["time"] = post.time;
            res["latitude"] = post.latitude;
            res["longitude"] = post.longitude;
            let isLiked = false;
            if (post.likes && post.likes[uid]){
                isLiked = true;
            }
            let isReported = false;
            if (post.reports && post.reports[uid]){
                isReported = true;
            }
            res["isOwner"] = (post.owner == uid);
            res["isLiked"] = isLiked;
            res["isReported"] = isReported;
            return db.ref("Users/"+post.owner).once("value")
            .then((snap)=>{
                const user = snap.val();
                res["ownerName"] = user.username;
                let ownerAvatar = "";
                if (user.avatar){
                    ownerAvatar = user.avatar.url;
                }
                res["ownerAvatar"]=ownerAvatar;
                return res;
            })
        }else{
            return {};
        }
    })
})