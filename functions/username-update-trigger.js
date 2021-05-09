const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("TouristSupport");

exports.usernameUpdateTrigger = functions.database.ref("Users/{userId}/username")
    .onUpdate((snap,context)=>{
        const data = snap.after.val();
        const uid = context.params.userId;
        const userRef = db.ref("Users/"+uid);
        return userRef.once("value")
            .then((snap)=>{
                return snap.val().email;
            }).then((email)=>{
                const user = {
                    "objectID":uid,
                    "username":data,
                    "email":email
                };
                return index.saveObject(user);
            })
        
    })