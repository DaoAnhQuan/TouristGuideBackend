const functions = require("firebase-functions");
const admin = require('firebase-admin');

const db =admin.database();

exports.getGroupType = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const userRef = db.ref("Users/"+uid);
    return userRef.once("value")
    .then((value)=>{
        return value.val().group;
    }).then((group)=>{
        const groupRef = db.ref("Groups/"+group);
        return groupRef.once("value");
    }).then((snapshot)=>{
        const groupInfo = snapshot.val();
        const members = groupInfo.members;
        const state = members[uid].state;
        let locationSharing = "off";
        if (state == "Accepted" || state == "Leader and Accepted"){
            locationSharing = "on";
        }
        let type = "individual";
        if (state == "Leader" || state == "Leader and Accepted"){
            type = "leader";
        }else{
            if (groupInfo.type == "group"){
                type = "member";
            }
        }
        let photo = "";
        if (groupInfo.photo){
            photo = groupInfo.photo;
        }
        return {
            "groupID":snapshot.key,
            "type":type,
            "location sharing": locationSharing,
            "group name": groupInfo.name,
            "group photo": photo,
        };
    });
})