const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const { user } = require("firebase-functions/lib/providers/auth");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("TouristSupport");


exports.searchUser = functions.https.onCall((data,context)=>{
    const query = data.query;
    const uid = context.auth.uid;
    let listUser = [];
    let listUrls = [];
    let listGroups = [];
    let listMembers = {};
    let map = new Map();
    return db.ref("Users/"+uid+"/group").once("value")
        .then((snap)=>{
            const groupID = snap.val();
            return db.ref("Groups/"+groupID+"/members").once("value")
                .then((snap)=>{
                    return snap.val();
                })
        })
        .then((members)=>{
            for (const memberID in members){
                map.set(memberID,true);
            }
        })
        .then(()=>{
            return index.search(query);
        })
        .then((res)=>{
            let listPromise = [];
            let i = 0;
            for (i = 0; i<res.hits.length;i++){
                let user = res.hits[i];
                if (map.has(user.objectID)){
                    continue;
                }
                listUser.push({
                    "username":user.username,
                    "uid":user.objectID
                });
                let userRef = db.ref("Users/"+user.objectID+"/avatar/url");
                listPromise.push(userRef.once("value").then((snap)=>{
                    return snap.val();
                }));
            }
            return Promise.all(listPromise);
        })
        .then((urls)=>{
            for (let url in urls){
                listUrls.push(urls[url]);
            }
        }).then(()=>{
            let listPromise=[];
            let i;
            for (i=0;i<listUser.length;i++){
                let user = listUser[i];
                let userGroupRef = db.ref("Users/"+user["uid"]+"/group");
                listPromise.push(userGroupRef.once("value").then((snap)=>{
                    return snap.val();
                }))
            }
            return Promise.all(listPromise);
        }).then((groups)=>{
            let listPromise=[];
            let i ;
            for (i=0;i<groups.length;i++){
                let group=groups[i];
                let groupTypeRef = db.ref("Groups/"+group+"/type");
                listPromise.push(groupTypeRef.once("value").then((snap)=>{
                    return snap.val();
                }));
            }
            return Promise.all(listPromise);
        }).then((groupTypes)=>{
            let i;
            for (i=0;i<groupTypes.length;i++){
                let groupType = groupTypes[i];
                listGroups.push(groupType);
            }
        }).then(()=>{
            let i = 0;
            let len;
            if (listUser.length>20){
                len = 20;
            }else{
                len = listUser.length;
            }
            for (i = 0; i<len;i++){
                let user = listUser[i];
                let groupType = listGroups[i];
                if (groupType == "individual"){
                    listMembers[user["uid"]]={
                        "uid":user["uid"],
                        "username":user["username"],
                        "url":listUrls[i]
                    }
                }
            }
            return listMembers;
        })
})