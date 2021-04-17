const functions = require("firebase-functions");
const signUp = require("./sign-up.js");
const updateAvatar = require("./update-avatar.js");
const updateUsername = require("./update-username.js");
const updateTelephoneNumber = require("./update-telephone-number.js");
const getGroupType = require("./get-group-type.js");
const updateUserLocation = require("./update-user-location.js");
const getMembersLocation = require("./get-members-location.js");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.test = functions.https.onRequest((req,res)=>{
//   const time = helper.getDateString();
//     res.send(200,time);
// }
// );

exports.signUp = signUp.signUp;
exports.updateAvatar = updateAvatar.updateAvatar;
exports.updateUsername = updateUsername.updateUsername;
exports.updateTelephoneNumber = updateTelephoneNumber.updateTelephoneNumber;
exports.getGroupType = getGroupType.getGroupType;
exports.updateUserLocation = updateUserLocation.updateUserLocation;
exports.getMembersLocation = getMembersLocation.getMembersLocation;

