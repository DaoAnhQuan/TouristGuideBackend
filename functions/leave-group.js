const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.leaveGroup = functions.https.onCall((data,context)=>{
    let uid = context.auth.uid;
    if (data){
        uid = data.uid;
    }
    let newGroupID;
    let currentGroupID;
    let currentMemberIsPending;
    let fromName;
    let fromUrl="";
    db.ref("Users/"+uid).update({
        "unread_messages":0
    });
    return db.ref("Users/"+context.auth.uid).once("value")
        .then((snapshot)=>{
            fromName = snapshot.val().username;
            if (snapshot.val().avatar){
                fromUrl = snapshot.val().avatar.url;
            }
            return snapshot.val().group;
        })
        .then((groupID)=>{
            currentGroupID = groupID;
            return db.ref("Groups/"+groupID+"/members/"+uid).once("value")
                .then((snapshot)=>{
                    return snapshot.exists();
                })
                .then((isMember)=>{
                    if (isMember){
                        return db.ref("Groups/"+groupID+"/members").once("value")
                            .then((snapshot)=>{
                                return snapshot.val();
                            })
                            .then((members)=>{
                                const currentMember = members[uid];
                                if (currentMember.state == "Leader" || currentMember.state == "Leader and Accepted"){
                                    let acceptedMemberID;
                                    for (const memberID in members){
                                        if (memberID == uid){
                                            continue;
                                        }
                                        const member = members[memberID];
                                        if (member.state == "Accepted"){
                                            acceptedMemberID = memberID;
                                            return db.ref("Groups/"+currentGroupID+"/members/"+acceptedMemberID)
                                                .update({
                                                    "state":"Leader and Accepted"
                                                })
                                        }
                                        if (member.state == "Accepted and No Sharing"){
                                            acceptedMemberID = memberID;
                                            return db.ref("Groups/"+currentGroupID+"/members/"+acceptedMemberID)
                                                .update({
                                                    "state":"Leader"
                                                })
                                        }   
                                    }
                                }
                                currentMemberIsPending = (currentMember.state == "Pending");
                            })
                            .then(()=>{
                                if (!currentMemberIsPending){
                                    return db.ref("Groups").push({
                                        "type":"individual"
                                    })
                                }
                            })
                            .then((ref)=>{
                                if (!currentMemberIsPending){
                                    const memberRef = db.ref("Groups/"+ref.key+"/members/"+uid);
                                    newGroupID = ref.key;
                                    return memberRef.set({
                                        "state":"Accepted"
                                    });
                                }
                            })
                            .then(()=>{
                                if (!currentMemberIsPending){
                                    return db.ref("Users/"+uid).update({
                                        "group":newGroupID
                                    });
                                }
                            })
                            .then(()=>{
                                return db.ref("Groups/"+currentGroupID+"/members/"+uid).remove();
                            })
                            .then(()=>{
                                if (data){
                                    db.ref("Users/"+data.uid+"/notifications").push({
                                        "type":"remove member",
                                        "content":currentGroupID,
                                        "from":context.auth.uid,
                                        "time":helper.getDateString()
                                    })
                                    db.ref("Users/"+data.uid+"/username").once("value")
                                        .then((snap)=>{
                                            return db.ref("Groups/"+currentGroupID+"/messages").push({
                                                "type":"notification",
                                                "content": fromName +" removed "+snap.val()+ " from the group.",
                                                "from":context.auth.uid,
                                                "fromName":fromName,
                                                "fromUrl":fromUrl,
                                                "time":helper.getDateString()
                                            })
                                        })
                                }else{
                                    return db.ref("Groups/"+currentGroupID+"/messages").push({
                                        "type":"notification",
                                        "from":uid,
                                        "fromName":fromName,
                                        "fromUrl":fromUrl,
                                        "content": fromName + " left the group.",
                                        "time":helper.getDateString()
                                    })
                                }
                            })
                    }
                })
        })
        
})