const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.newNotificationTrigger = functions.database.ref("Users/{uid}/notifications/{nof_id}")
    .onCreate((snap,context)=>{
        const numNofRef = db.ref("Users/"+context.params.uid);
        return numNofRef.once("value").then((snap)=>{
            return snap.val().number_of_notifications;
        }).then((curVal)=>{
            numNofRef.update({"number_of_notifications":curVal+1});
        })
    });