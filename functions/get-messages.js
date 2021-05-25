const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.database();

exports.getMessages = functions.https.onCall((data,context)=>{
    const groupID = data.groupID;
    const groupName = data.groupName;
    return db.ref("Groups/"+groupID+"/messages").once("value")
        .then((messages)=>{
            let listPromise = [];
            for (const messageID in messages){
                const message = messages[messageID];
                let fromName;
                let fromUrl="";
                const content = db.ref("Users/"+message.from).once("value")
                        .then((snap)=>{
                            const user = snap.val();
                            fromName = user.username;
                            if (user.avatar){
                                fromUrl = user.avatar.url;
                            }
                        })
                        .then(()=>{
                            if (message.type == "creation"){
                                return {
                                    type:"notification",
                                    id:messageID,
                                    fromName:fromName,
                                    fromUrl:fromUrl,
                                    content: fromName+" created the "+groupName+" group.",
                                    time:message.time
                                }
                            }
                            if (message.type == "invitation"){
                                return db.ref("Users/"+message.content+"/username").once("value")
                                    .then((snap)=>{
                                        const userName = snap.val();
                                        return {
                                            type:"notification",
                                            id:messageID,
                                            fromName:fromName,
                                            fromUrl:fromUrl,
                                            content: fromName+" invited "+userName+" into the group.",
                                            time:message.time
                                        }
                                    })
                            }
                            if (message.type == "response invitation"){
                                let response;
                                if (message.content=="accept"){
                                    response = "accepted";
                                }else{
                                    response = "declined"
                                }
                                return {
                                    type:"notification",
                                    id:messageID,
                                    fromName:fromName,
                                    fromUrl:fromUrl,
                                    content: fromName +" "+response+" the invitation to join the group.",
                                    time: message.time
                                }
                            }
                            if (message.type == "joined"){
                                return db.ref("Users/"+message.content+"/username").once("value")
                                    .then((snap)=>{
                                        const userName = snap.val();
                                        return {
                                            type:"notification",
                                            id:messageID,
                                            fromName:fromName,
                                            fromUrl:fromUrl,
                                            content: userName + " joined the group.",
                                            time:message.time,
                                        }
                                    })
                            }
                            if (message.type == "remove member"){
                                return db.ref("Users/"+message.content+"/username").once("value")
                                    .then((snap)=>{
                                        const userName = snap.val();
                                        return {
                                            type:"notification",
                                            id:messageID,
                                            fromName:fromName,
                                            fromUrl:fromUrl,
                                            content: fromName + " removed "+userName+" from the group.",
                                            time:message.time,
                                        }
                                    })
                            }
                            if (message.type == "leave"){
                                return {
                                    type:"notification",
                                    id:messageID,
                                    fromName:fromName,
                                    fromUrl:fromUrl,
                                    content: fromName +"left the group.",
                                    time: message.time
                                }
                            }
                            if (message.type == "change leader"){
                                return db.ref("Users/"+message.content+"/username").once("value")
                                    .then((snap)=>{
                                        const userName = snap.val();
                                        return {
                                            type:"notification",
                                            id:messageID,
                                            fromName:fromName,
                                            fromUrl:fromUrl,
                                            content: "Group leader is now "+userName+".",
                                            time:message.time,
                                        }
                                    })
                            }
                            let direction = "to";
                                if (message.from == context.auth.uid){
                                    direction = "from";
                                }
                            if (message.type == "text" || message.type == "photo"){
                                return {
                                    type:message.type,
                                    id:messageID,
                                    fromName: fromName,
                                    direction:direction,
                                    fromUrl:fromUrl,
                                    content: message.content,
                                    time:message.time
                                }
                            }
                        })
                        listPromise.push(content);
            }
            return Promise.all(listPromise);
        })
        .then((messages)=>{
            const length = messages.length;
            let i = 0;
            let response = {};
            for (;i<length;i++){
                const message = messages[i];
                response[message.id] = message;
            }
            return JSON.stringify(response);
        })
})