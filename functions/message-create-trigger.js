const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
exports.messageCreateTrigger = functions.database.ref("Groups/{groupID}/messages/{messageID}")
    .onCreate((snapshot,context)=>{
        const groupID = context.params.groupID;
        return db.ref("Groups/"+groupID+"/members").once("value")
        .then((snapshot)=>{
            return snapshot.val();
        })
        .then((members)=>{
            for (const memberID in members){
                const member = members[memberID];
                if (member.state != "Pending"){
                    db.ref("Users/"+memberID+"/unread_messages").once("value")
                    .then((snapshot)=>{
                        return snapshot.val();
                    })
                    .then((unreadMessages)=>{
                        return db.ref("Users/"+memberID).update({
                            "unread_messages":unreadMessages+1
                        });
                    })
                }
            }
        })
    })