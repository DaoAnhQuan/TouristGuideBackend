const admin = require("firebase-admin");
const functions = require("firebase-functions");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("Posts");
const geofire = require("geofire-common");


exports.getPost = functions.https.onCall((data,context)=>{
    const mode = data.mode;
    const topic = data.topic;
    const query = data.query;
    let listPosts = [];
    let listPostQuery = [];
    let check = true;
    if (mode == "All posts"){
        return index.search(query)
        .then((res)=>{
            const result = res.hits;
            let i = 0;
            let postIDs = {};
            for (;i<result.length;i++){
                const post = result[i];
                if (topic != "All"){
                    if (topic == post.topic){
                        listPostQuery.push(post.objectID);
                        postIDs[post.objectID] = true;
                    }
                }else{
                    listPostQuery.push(post.objectID);
                    postIDs[post.objectID] = true;
                }
            }
            if (listPostQuery.length == 0){
                check = false;
            }else{
                return db.ref("Posts").orderByChild("noLike").once("value").then((snap)=>{
                    const result = snap.val();
                    let posts = [];
                    for (const postID in result){
                        let post = result[postID];
                        if (postIDs[postID]){
                            post["postID"]=postID;
                            posts.push(post);
                        }
                    }
                    return posts;
                })
            }
        })
        .then((posts)=>{
            if (check){
                let i = 0;
                let listPromise = [];
                for (;i<posts.length;i++){
                    const post = posts[i];
                    let noReport = 0;
                    if (post.reports){
                        noReport = Object.keys(post.reports).length;
                    }
                    if (noReport <= 10){
                        let noLike = 0;
                        if (post.likes){
                            noLike = Object.keys(post.likes).length;
                        }
                        let noComment = 0;
                        if (post.comments){
                            noComment = Object.keys(post.comments).length;
                        }
                        const photos = JSON.parse(post.photo);
                        listPosts.push({
                            postID: post.postID,
                            time:post.time,
                            title:post.title,
                            photo:photos[0],
                            noLike:noLike,
                            noComment:noComment,
                            noShare:post.noShare
                        })
                        listPromise.push(db.ref("Users/"+post.owner).once("value")
                        .then((snap)=>{
                            const user = snap.val();
                            let avatar = "";
                            if (user.avatar){
                                avatar = user.avatar.url;
                            }
                            return {
                                ownerName:user.username,
                                ownerAvatar: avatar,
                            }
                        }))
                    }
                }
                if (listPromise.length == 0){
                    check = false;
                }else{
                    return Promise.all(listPromise);
                }
            }
        })
        .then((users)=>{
            if (check){
                let i = 0;
                let res = {};
                for (;i<users.length;i++){
                    const user =users[i];
                    listPosts[i]["ownerName"] = user.ownerName;
                    listPosts[i]["ownerAvatar"] = user.ownerAvatar;
                    res[listPosts[i]["postID"]] = listPosts[i];
                }
                return res;
            }else{
                return {};
            }
        })
    }
    if (mode == "Nearby"){
        const uid = context.auth.uid;
        let center;
        const radius =30*1000;
        let bounds;
        return db.ref("Users/"+uid+"/group").once("value").then((snap)=>{
            const groupID = snap.val();
            return db.ref("Groups/"+groupID+"/members/"+uid+"/location").once("value")
        })
        .then((snap)=>{
            const location = snap.val();
            const latitude = location.latitude;
            const longitude = location.longitude;
            center = [latitude,longitude];
            bounds = geofire.geohashQueryBounds(center,radius);
        })
        .then(()=>{
            return index.search(query);
        })
        .then((res)=>{
            const result = res.hits;
            let i = 0;
            let postIDs = {};
            for (;i<result.length;i++){
                const post = result[i];
                if (topic != "All"){
                    if (topic == post.topic){
                        listPostQuery.push(post.objectID);
                        postIDs[post.objectID] = true;
                    }
                }else{
                    listPostQuery.push(post.objectID);
                    postIDs[post.objectID] = true;
                }
            }
            if (listPostQuery.length == 0){
                check = false;
            }else{
                const promises = [];
                for (const b of bounds){
                    const q = db.ref("Posts").orderByChild("geohash").startAt(b[0]).endAt(b[1]).once("value")
                    .then((snap)=>{
                        return snap.val();
                    })
                    promises.push(q);
                }
                return Promise.all(promises).then((snapshot)=>{
                    let posts = [];
                    let i = 0;
                    for (;i<snapshot.length;i++){
                        const result = snapshot[i];
                        for (const postID in result){
                            const post = result[postID];
                            const latitude = post.latitude;
                            const longitude = post.longitude;
                            const distanceInKm = geofire.distanceBetween([latitude,longitude],center);
                            const distanceInM = distanceInKm*1000;
                            if (postIDs[postID] && distanceInM<radius){
                                postIDs[postID] = false;
                                post["postID"] = postID;
                                posts.push(post);
                            }
                        }
                    }
                    if (posts.length==0){
                        check = false;
                    }else{
                        return posts.sort((a,b)=>{return b.noLike - a.noLike});
                    }
                })
            }
        })
        .then((posts)=>{
            if (check){
                let i = 0;
                let listPromise = [];
                
                for (;i<posts.length;i++){
                    const post = posts[i];
                    let noReport = 0;
                    if (post.reports){
                        noReport = Object.keys(post.reports).length;
                    }
                    if (noReport <= 10){
                        const photos = JSON.parse(post.photo);
                        let noLike = 0;
                        if (post.likes){
                            noLike = Object.keys(post.likes).length;
                        }
                        let noComment = 0;
                        if (post.comments){
                            noComment = Object.keys(post.comments).length;
                        }
                        listPosts.push({
                            postID: post.postID,
                            time:post.time,
                            title:post.title,
                            photo:photos[0],
                            noLike:noLike,
                            noComment:noComment,
                            noShare:post.noShare
                        })
                        listPromise.push(db.ref("Users/"+post.owner).once("value")
                        .then((snap)=>{
                            const user = snap.val();
                            let avatar = "";
                            if (user.avatar){
                                avatar = user.avatar.url;
                            }
                            return {
                                ownerName:user.username,
                                ownerAvatar: avatar,
                            }
                        }))
                    }
                }
                if (listPromise.length == 0){
                    check = false;
                }else{
                    return Promise.all(listPromise);
                }
            }
        })
        .then((users)=>{
            if (check){
                let i = 0;
                let res = {};
                for (;i<users.length;i++){
                    const user =users[i];
                    listPosts[i]["ownerName"] = user.ownerName;
                    listPosts[i]["ownerAvatar"] = user.ownerAvatar;
                    res[listPosts[i]["postID"]] = listPosts[i];
                }
                return res;
            }else{
                return {};
            }
        })
    }
    if (mode == "My posts"){
        return index.search(query)
        .then((res)=>{
            const result = res.hits;
            let i = 0;
            let postIDs = {};
            for (;i<result.length;i++){
                const post = result[i];
                if (topic != "All"){
                    if (topic == post.topic){
                        listPostQuery.push(post.objectID);
                        postIDs[post.objectID] = true;
                    }
                }else{
                    listPostQuery.push(post.objectID);
                    postIDs[post.objectID] = true;
                }
            }
            if (listPostQuery.length == 0){
                check = false;
            }else{
                return db.ref("Posts").orderByChild("noLike").once("value").then((snap)=>{
                    const result = snap.val();
                    let posts = [];
                    for (const postID in result){
                        const post = result[postID];
                        if (postIDs[postID] && post.owner == context.auth.uid){
                            post["postID"] = postID;
                            posts.push(post);
                        }
                    }
                    if (posts.length == 0){
                        check = false;
                    }else{
                        return posts;
                    }
                })
            }
        })
        .then((posts)=>{
            if (check){
                let i = 0;
                let listPromise = [];
                for (;i<posts.length;i++){
                    const post = posts[i];
                    let noReport = 0;
                    if (post.reports){
                        noReport = Object.keys(post.reports).length;
                    }
                    if (noReport <= 10){
                        const photos = JSON.parse(post.photo);
                        let noLike = 0;
                        if (post.likes){
                            noLike = Object.keys(post.likes).length;
                        }
                        let noComment = 0;
                        if (post.comments){
                            noComment = Object.keys(post.comments).length;
                        }
                        listPosts.push({
                            postID: post.postID,
                            time:post.time,
                            title:post.title,
                            photo:photos[0],
                            noLike:noLike,
                            noComment:noComment,
                            noShare:post.noShare
                        })
                        listPromise.push(db.ref("Users/"+post.owner).once("value")
                        .then((snap)=>{
                            const user = snap.val();
                            let avatar = "";
                            if (user.avatar){
                                avatar = user.avatar.url;
                            }
                            return {
                                ownerName:user.username,
                                ownerAvatar: avatar,
                            }
                        }))
                    }
                }
                if (listPromise.length == 0){
                    check = false;
                }else{
                    return Promise.all(listPromise);
                }
            }
        })
        .then((users)=>{
            if (check){
                let i = 0;
                let res = {};
                for (;i<users.length;i++){
                    const user =users[i];
                    listPosts[i]["ownerName"] = user.ownerName;
                    listPosts[i]["ownerAvatar"] = user.ownerAvatar;
                    res[listPosts[i]["postID"]] = listPosts[i];
                }
                return res;
            }else{
                return {};
            }
        })
    }
})