const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.joinGroup = functions.https.onCall((data,context)=>{
    const groupID = data.groupID;
    const uid = context.auth.uid;
    let curGroupID;
    let fromName;
    let fromUrl = "";
    return db.ref("Users/"+uid).once("value")
        .then((snap)=>{
            fromName = snap.val().username;
            if (snap.val().avatar){
                fromUrl = snap.val().avatar.url;
            }
            return snap.val().group;
        })
        .then((currentGroupID)=>{
            curGroupID = currentGroupID;
            return db.ref("Groups/"+currentGroupID+"/type").once("value")
                .then((snap)=>{
                    return (snap.val() == "individual")
                })
        })
        .then((isValid)=>{
            if (isValid){
                return db.ref("Groups/"+groupID).once("value")
                    .then((snap)=>{
                        if (!snap.exists || snap.val().type == "individual"){
                            return "failed";
                        }else{
                            const members = snap.val().members;
                            let leaderID;
                            let t = 0;
                            let isPending = false;
                            for (const memberID in members){
                                const member = members[memberID];
                                if (member.state == "Leader" || member.state == "Leader and Accepted"){
                                    leaderID = memberID;
                                    t = 1;
                                }
                                if (memberID == uid && member.state == "Pending"){
                                    isPending = true;
                                }
                            }
                            if (t==0){
                                return "failed";
                            }else{
                                if (isPending){
                                    return db.ref("Groups/"+groupID+"/members/"+uid).update({
                                        "state":"Accepted and No Sharing",
                                    })
                                    .then(()=>{
                                        return db.ref("Users/"+uid).update({
                                            "group":groupID
                                        })
                                    })
                                    .then(()=>{
                                        return db.ref("Groups/"+groupID+"/messages").push({
                                            "type":"notification",
                                            "content": fromName+" accepted to join the group.",
                                            "from":uid,
                                            "fromName":fromName,
                                            "fromUrl":fromUrl,
                                            "time":helper.getDateString()
                                        })
                                    })
                                    .then(()=>{
                                        db.ref("Groups/"+curGroupID).remove();
                                        return "joined";
                                    })
                                }else{
                                    return db.ref("Users/"+leaderID+"/notifications").push({
                                        "type":"join request",
                                        "content":groupID,
                                        "from":uid,
                                        "time":helper.getDateString()
                                    }).then(()=>{
                                        return "request sent"
                                    })
                                }
                            }
                        }
                    })
            }else{
                return "failed";
            }
        })
    
})