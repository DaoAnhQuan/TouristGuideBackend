const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("TouristSupport");

exports.userDeleteTrigger = functions.database.ref("Users/{userId}")
    .onDelete((snap,context)=>{
        return index.deleteObject(context.params.userId);
    })