const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.updateLocationSetting = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const result = data.result;
    let memberRef;
    return db.ref("Users/"+uid+"/group")
        .once("value")
        .then((snap)=>{
            return snap.val();
        })
        .then((groupID)=>{
            memberRef = db.ref("Groups/"+groupID+"/members/"+uid);
            return memberRef.once("value").then((snap)=>{return snap.val().state});
        })
        .then((state)=>{
            if (state == "Pending"){
                if (result == "yes"){
                    memberRef.update({"state":"Accepted"});
                }else{
                    memberRef.update({"state":"Accepted and No Sharing"});
                }
            }
            if (state == "Leader"){
                if (result == "yes"){
                    memberRef.update({"state":"Leader and Accepted"});
                }
            }
            if (state == "Accepted"){
                if (result == "no"){
                    memberRef.update({"state":"Accepted and No Sharing"});
                }
            }
            if (state == "Accepted and No Sharing"){
                if (result == "yes"){
                    memberRef.update({"state":"Accepted"});
                }
            }
            if (state == "Leader and Accepted"){
                if (result == "no"){
                    memberRef.update({"state":"Leader"})
                }
            }
        })
})