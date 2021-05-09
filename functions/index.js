const functions = require("firebase-functions");
const signUp = require("./sign-up.js");
const updateAvatar = require("./update-avatar.js");
const updateUsername = require("./update-username.js");
const updateTelephoneNumber = require("./update-telephone-number.js");
const getGroupType = require("./get-group-type.js");
const updateUserLocation = require("./update-user-location.js");
const getMembersLocation = require("./get-members-location.js");
const userCreateTrigger = require("./user-create-trigger");
const usernameUpdateTrigger = require("./username-update-trigger.js");
const userDeleteTrigger = require("./user-delete-trigger.js");
const testFunction = require("./test-function.js");
const searchUser = require("./search-user.js");
const createGroup = require("./create-group.js");
const newNotificationTrigger = require("./new-notification-trigger.js");
const updateLocationSetting = require("./update-location-setting.js");
const getNotifications = require("./get-notifications.js");
const messageCreateTrigger = require("./message-create-trigger.js");
const notificationProcess = require("./notification-process.js");
const leaveGroup = require("./leave-group.js");
const joinGroup = require("./join-group.js");
const getMembersInfo = require("./get-members-info.js");

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
exports.userCreateTrigger = userCreateTrigger.userCreateTrigger;
exports.usernameUpdateTrigger = usernameUpdateTrigger.usernameUpdateTrigger;
exports.userDeleteTrigger = userDeleteTrigger.userDeleteTrigger;
exports.testFunction = testFunction.testFunction;
exports.searchUser = searchUser.searchUser;
exports.createGroup = createGroup.createGroup;
exports.newNotificationTrigger = newNotificationTrigger.newNotificationTrigger;
exports.updateLocationSetting = updateLocationSetting.updateLocationSetting;
exports.getNotifications = getNotifications.getNotifications;
exports.messageCreateTrigger = messageCreateTrigger.messageCreateTrigger;
exports.notificationProcess = notificationProcess.notificationProcess;
exports.leaveGroup = leaveGroup.leaveGroup;
exports.joinGroup = joinGroup.joinGroup;
exports.getMembersInfo = getMembersInfo.getMembersInfo;