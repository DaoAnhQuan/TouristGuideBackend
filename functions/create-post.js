const admin = require("firebase-admin");
const functions = require("firebase-functions");
const geofire = require("geofire-common");
const helper = require("./helper.js");

const db = admin.database();

exports.createPost = functions.https.onCall((data,context)=>{
    const uid = context.auth.uid;
    const action = data.action;
    const photoUrls = data.photoUrls;
    const topic = data.topic;
    const title = data.title;
    const latitude = data.latitude;
    const longitude = data.longitude;
    const description = data.description;
    const geohash = geofire.geohashForLocation([latitude, longitude]);
    if (action == "create"){
        return db.ref("Posts").push({
            topic:topic,
            title:title,
            description:description,
            owner:uid,
            time:helper.getDateString(),
            latitude:latitude,
            longitude:longitude,
            geohash:geohash,
            photo:JSON.stringify(photoUrls),
            noShare:0,
            noLike:0,
            noComment:0
        })
    }else{
        return db.ref("Posts/"+data.postID).update({
            topic:topic,
            title:title,
            description:description,
            owner:uid,
            time:helper.getDateString(),
            latitude:latitude,
            longitude:longitude,
            geohash:geohash,
            photo:JSON.stringify(photoUrls),
            noShare:0,
        })
    }
    // .then((ref)=>{
    //     let res = {};
    //     res[ref.key] = ref.key;
    //     db.ref("Users/"+uid+"/posts").update(res);
    // })
})