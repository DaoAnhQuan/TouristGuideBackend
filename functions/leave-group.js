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
    db.ref("Users/"+uid).update({
        "unread_messages":0
    });
    return db.ref("Users/"+uid+"/group").once("value")
        .then((snapshot)=>{
            return snapshot.val();
        })
        .then((groupID)=>{
            currentGroupID = groupID;
            return db.ref("Groups/"+groupID+"/members").once("value")
                .then((snapshot)=>{
                    return snapshot.val();
                })
        })
        .then((members)=>{
            const currentMember = members[uid];
            if (currentMember.state == "Leader" || currentMember.state == "Leader and Accepted"){
                let acceptedMemberID;
                for (const memberID in members){
                    const member = members[memberID];
                    if (member.state == "Accepted"){
                        acceptedMemberID = memberID;
                        return db.ref("Groups/"+groupID+"/members/"+acceptedMemberID)
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
        })
        .then(()=>{
            return db.ref("Groups").push({
                "type":"individual"
            })
          })
        .then((ref)=>{
            const memberRef = db.ref("Groups/"+ref.key+"/members/"+uid);
            newGroupID = ref.key;
            return memberRef.set({
                "state":"Accepted"
            });
            
        })
        .then(()=>{
            return db.ref("Users/"+uid).update({
                "group":newGroupID
            });
        })
        .then(()=>{
            return db.ref("Groups/"+currentGroupID+"/members/"+uid).remove();
        })
        .then(()=>{
            if (data){
                return db.ref("Groups/"+currentGroupID+"/messages").push({
                    "type":"kick",
                    "content":data.uid,
                    "from":context.auth.uid,
                    "time":helper.getDateString()
                })
            }else{
                return db.ref("Groups/"+currentGroupID+"/messages").push({
                    "type":"leave",
                    "from":uid,
                    "time":helper.getDateString()
                })
            }
        })
})