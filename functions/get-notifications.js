const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.getNotifications = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;

    return db.ref("Users/"+uid).once("value")
        .then((snap)=>{
            const notifications = snap.val().notifications;
            let listPromise = [];
            for (const notificationID in notifications){
                console.log(notificationID);
                const notification = notifications[notificationID];
                let content;
                if (notification.type == "invitation" || notification.type == "join request"){
                    let fromName="";
                    let fromUrl="";
                    let groupName="";
                    content = db.ref("Users/"+notification.from).once("value")
                        .then((snap)=>{
                            fromName = snap.val().username;
                            if (snap.val().avatar){
                                fromUrl = snap.val().avatar.url;
                            }
                        }).then(()=>{
                            return db.ref("Groups/"+notification.content).once("value")
                                .then((snap)=>{
                                    groupName = snap.val().name;
                                })
                        }).then(()=>{
                            let response = {};
                            if (notification.type == "invitation"){
                                response[notificationID]={
                                    "id":notificationID,
                                    "type":"invitation",
                                    "content": "<b>"+fromName+"</b> invited you to join the group <b>"+groupName+"</b>.",
                                    "url":fromUrl,
                                    "time":notification.time
                                }
                            }
                            if (notification.type == "join request"){
                                response[notificationID]={
                                    "id":notificationID,
                                    "type":"join request",
                                    "content": "<b>"+fromName+"</b> wants to join your <b>"+groupName+"</b> group.",
                                    "url":fromUrl,
                                    "time":notification.time
                                }
                            }
                            return response;
                        });
                }
                if (notification.type == "join request response"){
                    content = db.ref("Groups/"+notification.content).once("value")
                        .then((snap)=>{
                            return snap.val().name
                        })
                        .then((groupName)=>{
                            let response = {};
                            response[notificationID] = {
                                "id":notificationID,
                                "type":"join request response",
                                "content": "Your request to join the <b>" +groupName+ "</b> group was declined.",
                                "url":"",
                                "time":notification.time
                            }
                            return response;
                        })
                
                }
                if (notification.type == "remove member"){
                    let groupName;
                    content = db.ref("Groups/"+notification.content+"/name").once("value")
                        .then((snap)=>{
                            groupName = snap.val();
                            return db.ref("Users/"+notification.from).once("value")
                        })
                        .then((snap)=>{
                            let fromUrl = "";
                            const user = snap.val();
                            if (user.avatar){
                                fromUrl = user.avatar.url;
                            }
                            let response= {};
                            response[notificationID] = {
                                id:notificationID,
                                type:"remove member",
                                content: "You have been removed from the <b>"+groupName+"</b> group by <b>"+user.username+"</b>.",
                                url:fromUrl,
                                time:notification.time
                            }
                            return response;
                        })
                }
                listPromise.push(content);
            }
            return Promise.all(listPromise)
        }).then((response)=>{
            let i = 0;
            let res = {};
            for (;i<response.length;i++){
                const notification = response[i];
                const id = Object.keys(notification)[0];
                res[id] = notification[id];
            }
            
            return JSON.stringify(res);
        });
})