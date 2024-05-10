const FCM = require('fcm-node');
const axios = require('axios');
const { config } = require("../../config/index");
const sqlhelper = require("./sqlhelper");

exports.sendFireBaseNotification = async (deviceTokenID, payload) => {
    try {
        let notificationBody = {
            title: payload.title,
            body: payload.description,
            text: payload.description,
            badge: '1',
            sound: 'deafult',
        }
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: deviceTokenID,
            notification: notificationBody,
            data: payload
        };
        var serverKey
        if(payload.sent_to==1){
            serverKey=config.Admin_FireBase_Key;
        }else if(payload.sent_to==2){
            serverKey=config.Store_FireBase_Key;
        }else if(payload.sent_to==4){
            serverKey=config.Telecaller_FireBase_Key;
        }else{
            serverKey=config.User_FireBase_Key;
        }
        var fcm = new FCM(serverKey);
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", err);
                return false
            } else {
                console.log("Successfully sent with response: ", response);
                return true
            }
        });
    }
    catch (e) {
        console.log("Something has gone wrong!", e);
        return false
    }
}
exports.sendOneSignalNotification = async (payload) => {
    try {

        let headings = { "en": payload.title ? payload.title : '' };
        let contents = { "en": payload.description ? payload.description : '' };

        let redirectUrl;
        if (payload.screen == 'admin-statistics') {
            redirectUrl = 'http://localhost:3000/admin-statistics';
        } else if (payload.screen == 'notification') {
            // redirectUrl = 'http://admin.jyffit.s3-website.ap-south-1.amazonaws.com/notification';
        } else if (payload.screen == 'userList') {
            // redirectUrl = 'http://admin.jyffit.s3-website.ap-south-1.amazonaws.com/user';
        } else if (payload.screen == 'sellerList') {
            // redirectUrl = 'http://admin.jyffit.s3-website.ap-south-1.amazonaws.com/rider';
        } else {
            redirectUrl = payload.screen;
        }


        let oneSignalAPP_ID = '';
        let oneSignalAPI_KEY = '';

        if (payload.sent_to == 1) {
            oneSignalAPP_ID = config.Admin_OneSignalAPP_ID;
            oneSignalAPI_KEY = config.Admin_OneSignalAPI_KEY;
        } else if (payload.sent_to == 2) {
            oneSignalAPP_ID = config.Store_OneSignalAPP_ID;
            oneSignalAPI_KEY = config.Store_OneSignalAPI_KEY;
        } else if (payload.sent_to == 4) {
            oneSignalAPP_ID = config.Telecaller_OneSignalAPP_ID;
            oneSignalAPI_KEY = config.Telecaller_OneSignalAPI_KEY;
        } else {
            oneSignalAPP_ID = config.User_OneSignalAPP_ID;
            oneSignalAPI_KEY = config.User_OneSignalAPI_KEY;
        }

        const utcDate = new Date(payload.sent_at).toUTCString();

        const Payload = {
            "app_id": oneSignalAPP_ID,
            "headings": headings,
            "contents": contents,
            "url": redirectUrl,
            "chrome_web_image": payload.image,
            "include_player_ids": [payload.include_player_ids],
            "web_buttons": payload.web_buttons,
            "send_after": payload.is_schedule == 1 ? utcDate:'',
        }

        const notificationRes = await axios.post(`https://onesignal.com/api/v1/notifications`, Payload, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${oneSignalAPI_KEY}`
            }
        });
        console.log("Payload===================",notificationRes);
        if (notificationRes.status == 200) {
            if (payload.is_save == 1) {
                delete payload.web_buttons;
                delete payload.sent_at;
                delete payload.is_schedule;
                await sqlhelper.insert('notifications', payload, (err, res) => {
                    if (err) {
                        return 0;
                    } else {
                        return res;
                    }
                }); 
            }
            return true;
        } else {
            return false;
        }
    }
    catch (e) {
        console.error(e.response.data);
    }
}
