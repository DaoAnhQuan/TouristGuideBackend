const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("Posts");
exports.postDeleteTrigger = functions.database.ref("Posts/{postID}")
    .onDelete((snap,context)=>{
        const data = snap.val();
        const postID = context.params.postID;
        db.ref("Users/"+data.owner+"/posts/"+postID).remove();
        return index.deleteObject(postID);
    })