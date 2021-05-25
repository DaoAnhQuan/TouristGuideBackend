const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");

exports.updateSOS = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const sos = data.sos;
    let memberRef;
    return db.ref("Users/"+uid+"/group").once("value")
        .then((snap)=>{
            const groupID = snap.val();
            return db.ref("Groups/"+groupID+"/type").once("value")
            .then((snap)=>{
                const type = snap.val();
                if (type== "group"){
                    memberRef = db.ref("Groups/"+groupID+"/members/"+uid);
                    return memberRef.once("value")
                        .then((snap)=>{
                            const state = snap.val().state;
                            if (state == "Leader"){
                                return "Leader and Accepted";
                            }else{
                                if (state == "Accepted and No Sharing"){
                                    return "Accepted";
                                }
                                else{
                                    return state;
                                }
                            }
                        })
                        .then((state)=>{
                            return memberRef.update({
                                SOS:sos,
                                state:state
                            });
                        })
                }
            })
            
        })
})