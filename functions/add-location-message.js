const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");
exports.addLocationMessage = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const groupID = data.groupID;
    const longitude = data.longitude;
    const latitude = data.latitude;
    let message = data.message;
    return db.ref("Users/"+uid).once("value")
        .then((snap)=>{
            const user = snap.val();
            const fromName = user.username;
            if (message==""){
                message = fromName+" shared a location."
            }
            let fromUrl = "";
            if (user.avatar){
                fromUrl = user.avatar.url;
            }
            const location = {
                longitude:longitude,
                latitude:latitude,
                message:message,
            };
            const locationJSON = JSON.stringify(location);
            db.ref("Groups/"+groupID+"/messages").push({
                type:"location",
                fromName:fromName,
                fromUrl:fromUrl,
                from:uid,
                time:helper.getDateString(),
                content: locationJSON
            });
            db.ref("Groups/"+groupID).update({
                lastLocationMessage:{
                    fromName:fromName,
                    fromUrl:fromUrl,
                    from:uid,
                    time:helper.getDateString(),
                    content:locationJSON
                }
            });
        })
})