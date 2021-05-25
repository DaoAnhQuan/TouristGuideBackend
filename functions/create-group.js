const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.createGroup = functions.https.onCall((data,context)=>{
    let fromName;
    let fromUrl="";
    return db.ref("Users/"+context.auth.uid).once("value")
        .then((snap)=>{
            fromName = snap.val().username;
            if (snap.val().avatar){
                fromUrl = snap.val().avatar.url;
            }
            const groupID = snap.val().group;
            return db.ref("Groups/"+groupID+"/type").once("value")
                .then((snap)=>{
                    return snap.val()=="individual";
                })
        })
        .then((isValid)=>{
            if (isValid){
                const groupRef = db.ref("Groups");
                let members = {};
                let currentGroup;
                let newGroup;
                const userGroupRef = db.ref("Users/"+context.auth.uid);
                members[context.auth.uid] = {
                    "state":"Leader"
                };

                const dataMembers = data.members;
                for (let uid in dataMembers){
                    members[uid] ={
                        "state":"Pending",
                    } 
                }
                let url = "";
                if (data.url){
                    url = data.url;
                }
                return groupRef.push({
                    "name":data.name,
                    "photo":url,
                    "members":members,
                    "type":"group"
                })
                .then((ref)=>{
                    newGroup = ref.key;
                })
                .then(()=>{
                    return userGroupRef.once("value").then((snap)=>{
                        currentGroup = snap.val().group;
                    })
                })
                .then(()=>{
                    return userGroupRef.update({"group":newGroup});
                })
                .then(()=>{
                    db.ref("Groups/"+currentGroup).remove();
                    db.ref("Groups/"+newGroup+"/messages").push({
                        "type":"notification",
                        "from":context.auth.uid,
                        "fromName":fromName,
                        "fromUrl":fromUrl,
                        "content": fromName+" created the "+data.name+" group.",
                        "time":helper.getDateString()
                    })
                    .then(()=>{
                        for (const uid in dataMembers){
                            db.ref("Users/"+uid+"/notifications").push({
                                "type":"invitation",
                                "content": newGroup,
                                "from": context.auth.uid,
                                "time": helper.getDateString()
                            });
                            db.ref("Users/"+uid+"/username").once("value")
                                .then((snap)=>{
                                    const memberName = snap.val();
                                    db.ref("Groups/"+newGroup+"/messages").push({
                                        "type":"notification",
                                        "content": fromName +" invited "+memberName+" to join the group.",
                                        "from":context.auth.uid,
                                        "fromName":fromName,
                                        "fromUrl":fromUrl,
                                        "time":helper.getDateString()
                                    })
                                })
                        }  
                    })
                })
            }
        })
})