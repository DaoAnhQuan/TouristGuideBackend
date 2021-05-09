const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.getMembersInfo = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    let response = {};
    return db.ref("Users/"+uid+"/group").once("value")
        .then((snap)=>{
            const groupID = snap.val();
            return db.ref("Groups/"+groupID+"/members").once("value")
                .then((snap)=>{
                    return snap.val();
                })
        })
        .then((members)=>{
            let listPromise = [];
            for (const memberID in members){
                const member = members[memberID];
                let state = "Member";
                if (member.state == "Pending"){
                    state = "Pending";
                }
                if (member.state == "Leader" || member.state == "Leader and Accepted"){
                    state = "Leader";
                }
                const content = db.ref("Users/"+memberID).once("value")
                    .then((snap)=>{
                        const user = snap.val();
                        response[user.uid] = {
                            "username":user.username,
                            "avatar_url":user.avatar.url,
                            "avatar_time":user.avatar.time,
                            "avatar_download":user.avatar.download.toString(),
                            "phone":user.phone,
                            "email":user.email,
                            "state":state,
                            "uid":user.uid
                        }
                    })
                listPromise.push(content);
            }
            return Promise.all(listPromise);
        })
        .then(()=>{
            return response;
        })
        
})