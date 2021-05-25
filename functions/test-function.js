const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const db = admin.database();
const client = algoliasearch(functions.config().algolia.appid,functions.config().algolia.apikey);
const index = client.initIndex("Posts");
const geofire = require("geofire-common");

exports.testFunction = functions.https.onRequest((req,respon)=>{
    const mode = "Nearby";
    const topic = "All";
    const query = "";
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
                return respon.send({});
            }
            return db.ref("Posts").orderByChild("noLike").once("value").then((snap)=>{
                const result = snap.val();
                let posts = [];
                for (const postID in result){
                    if (postIDs[postID]){
                        posts.push(result[postID]);
                    }
                }
                return posts;
            })
        })
        .then((posts)=>{
            if (check){
                let i = 0;
                let listPromise = [];
                
                for (;i<posts.length;i++){
                    const post = posts[i];
                    if (post.noReport <= 10){
                        const photos = JSON.parse(post.photo);
                        listPosts.push({
                            postID: listPostQuery[i],
                            time:post.time,
                            title:post.title,
                            photo:photos[0],
                            noLike:post.noLike,
                            noComment:post.noComment,
                            noShare:post.notShare
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
                    return {};
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
                respon.send(res);
            }
        })
    }
    if (mode == "Nearby"){
        const cars = [

            {
                name: "Honda",
                speed: 80
            },
        
            {
                name: "BMW",
                speed: 180
            },
        
            {
                name: "Trabi",
                speed: 40
            },
        
            {
                name: "Ferrari",
                speed: 200
            }
        ]
        respon.send(cars.sort((a,b)=> {return -a.speed+b.speed}));    
    }
})