const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("Posts");
let post;
exports.postUpdateTrigger = functions.database.ref("Posts/{postID}")
    .onUpdate((snap,context)=>{
        const data = snap.after.val();
        post = {
            "objectID":context.params.postID,
            "title":data.title,
            "description":data.description,
            "topic":data.topic
        };
        return db.ref("Users/"+data.owner).once("value")
        .then((snap)=>{
            post["owner"] = snap.val().username;
            return index.saveObject(post);
        });
    })
