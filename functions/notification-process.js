const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();
const helper = require("./helper.js");
exports.notificationProcess = functions.https.onCall((data,context)=>{
    const notificationID = data.notificationID;
    const action = data.action;
    const uid = context.auth.uid;
    let notification;
    let fromName;
    let fromUrl = "";
    return db.ref("Users/"+uid).once("value")
        .then((snap)=>{
            fromName = snap.val().username;
            if (snap.val().avatar){
                fromUrl = snap.val().avatar.url;
            }
            const notifications = snap.val().notifications;
            notification = notifications[notificationID];
            if (notification.type == "invitation"){
                let isPendingMember = false;
                return db.ref("Groups/"+notification.content+"/members/"+uid).once("value")
                    .then((snap)=>{
                        if (snap.exists()){
                            const member = snap.val();
                            return (member.state == "Pending");
                        }
                        return false;
                    })
                    .then((isPending)=>{
                        isPendingMember = isPending;
                        return db.ref("Users/"+uid+"/group").once("value")
                            .then((snap)=>{
                                const groupID = snap.val();
                                return db.ref("Groups/"+groupID+"/type").once("value")
                                    .then((snap)=>{
                                        const groupType = snap.val();
                                        return (groupType == "individual") && isPending;
                                    })
                            })
                    })
                    .then((isPending)=>{
                        if (isPending){
                            if (action == "accept"){
                                return db.ref("Groups/"+notification.content).once("value")
                                    .then((snap)=>{
                                        return snap.val().members;
                                    })
                                    .then((members)=>{
                                        const keys = Object.keys(members);
                                        if (keys.length==0){
                                            return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                            .then(()=>{
                                                return db.ref("Groups/"+notification.content).remove();
                                            }).then(()=>{
                                                return "failed";
                                            });
                                        }else{
                                            let i = 0;
                                            let t = 0;
                                            db.ref("Groups/"+notification.content+"/messages").push({
                                                "type":"notification",
                                                "content": fromName + " accepted to join the group.",
                                                "from":uid,
                                                "fromName":fromName,
                                                "fromUrl":fromUrl,
                                                "time":helper.getDateString()
                                            });
                                            for (; i<keys.length;i++){
                                                const member = members[keys[i]];
                                                if (member.state == "Leader" || member.state == "Leader and Accepted"){
                                                    t = 1;
                                                    break;
                                                }
                                            }
                                            if (t==0){
                                                return db.ref("Groups/"+notification.content+"/members/"+uid).update({
                                                    "state":"Leader"
                                                })
                                                .then(()=>{
                                                    return db.ref("Users/"+uid+"/notifications/"+notificationID).remove();
                                                }).then(()=>{
                                                    return "success";
                                                })
                                            }else{
                                                return db.ref("Groups/"+notification.content+"/members/"+uid).update({
                                                    "state":"Accepted and No Sharing"
                                                })
                                                .then(()=>{
                                                    return db.ref("Users/"+uid+"/notifications/"+notificationID).remove();
                                                }).then(()=>{
                                                    return "success";
                                                })
                                            }
                                        }
                                    })
                                    .then((response)=>{
                                        if (response == "success"){
                                            return db.ref("Users/"+uid).update({
                                                "group":notification.content,
                                            })
                                            .then(()=>{
                                                return response;
                                            })
                                        }else{
                                            return response;
                                        }
                                    })
                                    
                            }else{
                                return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                    .then(()=>{
                                        return db.ref("Groups/"+notification.content+"/members/"+uid).remove();
                                    })
                                    .then(()=>{
                                        return db.ref("Groups/"+notification.content+"/messages").push({
                                            "type": "notification",
                                            "content": fromName +" declined to join the group.",
                                            "from":uid,
                                            "fromName":fromName,
                                            "fromUrl":fromUrl,
                                            "time":helper.getDateString()
                                        })
                                    })
                                    .then(()=>{
                                        return "success";
                                    })
                            }
                        }else{
                            if (action == "decline"){
                                return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                    .then(()=>{
                                        if (isPendingMember){
                                            return db.ref("Groups/"+notification.content+"/members/"+uid).remove();
                                        }
                                    })
                                    .then(()=>{
                                        if (isPendingMember){
                                            return db.ref("Groups/"+notification.content+"/messages").push({
                                                "type": "notification",
                                                "content": fromName +" declined to join the group.",
                                                "from":uid,
                                                "fromName":fromName,
                                                "fromUrl":fromUrl,
                                                "time":helper.getDateString()
                                            })
                                        }
                                    })
                                    .then(()=>{
                                        return "success";
                                    })
                            }else{
                                return "failed";
                            }
                        }
                    })
            }
            //Join request process
            if (notification.type == "join request"){
                return db.ref("Users/"+uid+"/group").once("value")
                    .then((snap)=>{
                        const groupID = snap.val();
                        return db.ref("Groups/"+groupID+"/members").once("value")
                            .then((snap)=>{
                                return snap.val();
                            })
                    })
                    .then((members)=>{
                        let t = 0;
                        for (const memberID in members){
                            const member = members[memberID];
                            if(memberID == uid && (member.state == "Leader" || member.state == "Leader and Accepted")){
                                t=1;
                                break;
                            }
                        }
                        if (t==0){
                            return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                .then(()=>{
                                    return "Currently you are not the group leader.";
                                })
                        }else{
                            let memberName;
                            return db.ref("Users/"+notification.from).once("value")
                                .then((snap)=>{
                                    memberName = snap.val().username;
                                    return snap.val().group;
                                })
                                .then((curGroupID)=>{
                                    return db.ref("Groups/"+curGroupID+"/type").once("value")
                                        .then((snap)=>{
                                            return snap.val();
                                        })
                                        .then((curGroupType)=>{
                                            if (action == "accept"){
                                                if (curGroupType=="group"){
                                                    return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                                        .then(()=>{
                                                            return "This user is currently unable to join your group."
                                                        })
                                                }else{
                                                    return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                                        .then(()=>{
                                                            const memberRef = db.ref("Groups/"+notification.content+"/members/"+notification.from);
                                                            return memberRef.once("value")
                                                                .then((snap)=>{
                                                                    if (snap.exists()){
                                                                        if (snap.val().state == "Pending"){
                                                                            return memberRef.update({
                                                                                "state":"Accepted and No Sharing"
                                                                            })
                                                                        }
                                                                    }else{
                                                                        return memberRef.set({
                                                                            "state":"Accepted and No Sharing"
                                                                        })
                                                                    }
                                                                })
                                                        })
                                                        .then(()=>{
                                                            return db.ref("Users/"+notification.from).update({
                                                                "group": notification.content
                                                            })
                                                        })
                                                        .then(()=>{
                                                            return db.ref("Groups/"+notification.content+"/messages").push({
                                                                "type":"notification",
                                                                "from":uid,
                                                                "fromUrl":fromUrl,
                                                                "fromName":fromName,
                                                                "content": memberName+" joined the group.",
                                                                "time":helper.getDateString()
                                                            })
                                                        })
                                                        .then(()=>{
                                                            return "Successful!"
                                                        })
                                                }
                                            }else{
                                                return db.ref("Users/"+uid+"/notifications/"+notificationID).remove()
                                                    .then(()=>{
                                                        return db.ref("Users/"+notification.from+"/notifications").push({
                                                            "type":"join request response",
                                                            "content":notification.content,
                                                            "time":helper.getDateString()
                                                        })
                                                    })
                                                    .then(()=>{
                                                        return "Declined!";
                                                    })
                                            }
                                        })
                                })
                        }
                    })
            } 
        })    
})