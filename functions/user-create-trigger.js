const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("TouristSupport");

exports.userCreateTrigger = functions.database.ref("Users/{userId}")
    .onCreate((snap,context)=>{
        const data = snap.val();
        const user = {
            "objectID":context.params.userId,
            "username":data.username,
            "email":data.email,
        };
        return index.saveObject(user);
    })