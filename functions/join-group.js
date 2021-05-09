const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.joinGroup = functions.https.onCall((data,context)=>{
    const groupID = data.groupID;
    const uid = context.auth.uid;
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
                            "state":"Accepted",
                        })
                        .then(()=>{
                            return db.ref("Users/"+uid).update({
                                "group":groupID
                            })
                        })
                        .then(()=>{
                            return db.ref("Groups/"+groupID+"/messages").push({
                                "type":"response invitation",
                                "content":"accepted",
                                "from":uid,
                                "time":helper.getDateString()
                            })
                        })
                        .then(()=>{
                            return db.ref("Users/"+uid+"/group").once("value")
                                .then((snap)=>{
                                    return snap.val();
                                })
                                .then((curGroupID)=>{
                                    return db.ref("Groups/"+curGroupID).remove();
                                })
                        })
                        .then(()=>{
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
})