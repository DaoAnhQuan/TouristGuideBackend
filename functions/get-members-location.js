const admin = require("firebase-admin");
const functions = require("firebase-functions");

const db = admin.database();

exports.getMembersLocation = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const userRef = db.ref("Users/"+uid);
    const listLocation=[];
    const listID = []
    return userRef.once("value")
    .then((value)=>{
        return value.val().group;
    }).then((group)=>{
        const groupRef = db.ref("Groups/"+group);
        return groupRef.once("value");
    }).then((snapshot)=>{
        var members = snapshot.val().members;
        var listMembers = [];
        for (var member in members){
            var info = members[member];
            if (info.state =="Accepted"){
                var memberRef = db.ref("Users/"+member+"/avatar");
                listMembers.push(memberRef.once("value").then((snapshot)=>{return snapshot.val().url}));
                listLocation.push(info.location);
                listID.push(member);
            }
        }
        return Promise.all(listMembers);
    }).then((urls)=>{
        const response = {};
        for (let i = 0;i<listID.length;i++){
            response[listID[i]] = {
                "uid":listID[i],
                "url":urls[i],
                "latitude":listLocation[i].latitude,
                "longitude":listLocation[i].longitude
            }
        }
        return response;
    });
})