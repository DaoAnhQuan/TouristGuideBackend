const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");
exports.changeLeader = functions.https.onCall((data,context)=>{
    const memberID = data.memberID;
    const uid = context.auth.uid;
    db.ref("Users/"+uid+"/group").once("value")
        .then((snap)=>{
            return snap.val();
        })
        .then((groupID)=>{
            const leaderRef = db.ref("Groups/"+groupID+"/members/"+uid);
            leaderRef.once("value")
                .then((snap)=>{
                    return snap.val().state;
                })
                .then((state)=>{
                    let isLeader = false;
                    if (state == "Leader and Accepted"){
                        leaderRef.update({
                            "state":"Accepted"
                        })
                        isLeader = true;
                    }
                    if (state == "Leader"){
                        leaderRef.update({
                            "state":"Accepted and No Sharing"
                        })
                        isLeader = true;
                    }
                    return isLeader;
                })
                .then((isLeader)=>{
                    if (isLeader){
                        const memberRef = db.ref("Groups/"+groupID+"/members/"+memberID);
                        memberRef.once("value")
                            .then((snap)=>{
                                return snap.val().state;
                            })
                            .then((state)=>{
                                if (state == "Accepted"){
                                    memberRef.update({
                                        state: "Leader and Accepted"
                                    })
                                }
                                if (state == "Accepted and No Sharing"){
                                    memberRef.update({
                                        state:"Leader"
                                    });
                                }
                            })
                        db.ref("Users/"+memberID+"/username").once("value")
                        .then((snap)=>{
                            const memberName = snap.val();
                            db.ref("Groups/"+groupID+"/messages").push({
                                type:"notification",
                                content: "Group leader is now "+memberName+".",
                                from:uid,
                                fromName:"",
                                fromUrl:"",
                                time: helper.getDateString(),
                            })
                        })
                    }
                })
        })
    
})