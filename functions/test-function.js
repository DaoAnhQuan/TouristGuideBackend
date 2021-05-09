const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("TouristSupport");

exports.testFunction = functions.https.onRequest((req,res)=>{
    const uid = "8In6yl5sllZDlliVpYofnsDdUWG2";

    return db.ref("Users/"+uid).once("value")
        .then((snap)=>{
            const notifications = snap.val().notifications;
            let listPromise = [];
            for (const notificationID in notifications){
                const notification = notifications[notificationID];
                if (notification.type == "invitation"){
                    let fromName;
                    let fromUrl;
                    let groupName;
                    const content = db.ref("Users/"+notification.from).once("value")
                        .then((snap)=>{
                            fromName = snap.val().username;
                            fromUrl = snap.val().avatar.url;
                        }).then(()=>{
                            return db.ref("Groups/"+notification.content).once("value")
                                .then((snap)=>{
                                    groupName = snap.val().name;
                                })
                        }).then(()=>{
                            let response = {};
                            response[notificationID]={
                                "type":"invitation",
                                "content": "<b>"+fromName+"</b> invited you to join the group <b>"+groupName+"</b>.",
                                "url":fromUrl
                            }
                            return response;
                        });
                    listPromise.push(content);
                }
            }
            return Promise.all(listPromise)
        }).then((response)=>{
            let i = 0;
            let res1 = {};
            for (;i<response.length;i++){
                const notification = response[i];
                const id = Object.keys(notification)[0];
                res1[id] = notification[id];
            }
            res.send(res1);
        });
})