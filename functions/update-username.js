const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.database();

exports.updateUsername = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const userRefString = "Users/"+uid;
    const userRef = db.ref(userRefString);
    userRef.update({
        "username":data.username
    });
})