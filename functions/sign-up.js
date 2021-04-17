const functions = require("firebase-functions");
const admin = require('firebase-admin');
const helper = require("./helper");
admin.initializeApp();
const db = admin.database();

exports.signUp = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const refString = "Users/"+uid;
    const userRef = db.ref(refString);
    const groupRef = db.ref("Groups");
    
    userRef.once("value", function(snap){
      return snap;
    }).then(value=>{
      if (!value.exists()){
        userRef.set({
            "uid":uid,
            "username":data.username,
            "email":data.email
        })
        if (data.avatar){
            userRef.update({
                "avatar":{
                  "url": data.avatar,
                  "time": helper.getDateString(),
                  "download": false
                },
            });
        }
      }
    }
    ).then(()=>{
      return groupRef.push({
        "type":"individual"
      })
    }).then((ref)=>{
      const memberRef = db.ref("Groups/"+ref.key+"/members/"+uid);
      memberRef.set({
        "state":"Accepted"
      });
      userRef.update({
        "group":ref.key
      });
    })
})