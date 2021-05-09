const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");
exports.createGroup = functions.https.onCall((data,context)=>{
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
        return db.ref("Groups/"+currentGroup).remove();
    })
    .then(()=>{
        return db.ref("Groups/"+newGroup+"/messages").push({
            "type":"creation",
            "from":context.auth.uid,
            "time":helper.getDateString()
        })
    })
    .then(()=>{
        for (const uid in dataMembers){
            db.ref("Users/"+uid+"/notifications").push({
                "type":"invitation",
                "content": newGroup,
                "from": context.auth.uid,
                "time": helper.getDateString()
            });
            db.ref("Groups/"+newGroup+"/messages").push({
                "type":"invitation",
                "content":uid,
                "from":context.auth.uid,
                "time":helper.getDateString()
            })
        }
        
    })
})