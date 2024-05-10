const _ = require("lodash");
const encryptionhelper = require("../helper/encryption");
const moment = require('moment');
const sqlhelper = require("../helper/sqlhelper");
const validation = require("../middleware/validation");
const { watch_Log } = require("../helper/common");
const crypto = require('crypto');
const QRCode = require("qrcode");
const Jimp = require("jimp");
const cron = require('node-cron');

const cronJobModule = function (adminUser) {
    this.Device_Name = adminUser.Device_Name;
        // https://crontab.guru/
        // FIELD	    ALLOWED VALUES
        // minute	    0 - 59
        // hour	        0 - 23
        // day of month	1 - 31
        // month	    1 - 12 or names
        // day of week	0 - 7 or names, 0 and 7 refer to sunday
};

cronJobModule.generateStoreQRCode = async (req, callback) => {
    try {
        // At 12:00 on day-of-month 1 in January and July.
        cron.schedule('0 12 1 1,7 *', async () => {
            let getLastQrQuery = 'SELECT bunch_number FROM stores_qr_code ORDER BY created_at DESC limit 1';
            let getLastQr = await sqlhelper.select(getLastQrQuery, [], (err, res) => {
                if (err) {
                    return callback(err, new Array());
                } else {
                    return res[0];
                }
            });
            const bunch_number = (getLastQr)?(getLastQr.bunch_number+1):1;
            const logopath = "assets/images/lmg_fold_logo.jpg";
            const destPath = "assets/uploads/store/QRCode/";
            const insertBatch = [];
            for (let i = 1; i <= 3; i++) {
                let qr_name = crypto.createHash('md5').update(crypto.randomBytes(36).toString('hex')).digest('hex');
                let checkNameQuery = 'SELECT store_qr_code_id FROM stores_qr_code WHERE qr_name = ?';
                let checkName = await sqlhelper.select(checkNameQuery, [qr_name], (err, res) => {
                    if (err) {
                        return callback(err, new Array());
                    } else {
                        return res.length;
                    }
                });
                if(checkName === 0){
                    const filepath = destPath + "QR" + qr_name + ".png";
                    const codeContents = `${__frontLink}seller_product/${qr_name}`;

                    QRCode.toFile(
                        filepath,
                        codeContents,
                        { errorCorrectionLevel: "H" },
                        function (err) {
                        if (err) throw err;
                        Jimp.read(filepath, function (err, image) {
                            if (err) throw err;
                
                            Jimp.read(logopath, function (err, logo) {
                            if (err) throw err;
                
                            const qrWidth = image.bitmap.width;
                            const qrHeight = image.bitmap.height;
                            const logoWidth = logo.bitmap.width;
                            const logoHeight = logo.bitmap.height;
                
                            const logoQrWidth = qrWidth / 5;
                            const scale = logoWidth / logoQrWidth;
                            const logoQrHeight = logoHeight / scale;
                
                            image.composite(
                                logo.resize(logoQrWidth, logoQrHeight),
                                qrWidth / 2.5,
                                qrHeight / 2.5
                            );
                            image.write(filepath, function (err) {
                                if (err) throw err;
                                callback(null, {errorCode: 200,status: true,message: "Success"});
                            });
                            });
                        });
                        }
                    );
                    
                    const data = {
                        bunch_name: "LMGQR0"+bunch_number+moment().format("DDMMY"),
                        bunch_number:bunch_number,
                        qr_name: qr_name,
                        image: filepath,
                        created_by:(req.user)?req.user.admin_user_id:0,
                        created_ip:(req.user)?req.user.ipAddress:0,
                    }
                    insertBatch.push(data); 
                } 
            }
            if (insertBatch.length > 0) {
                let insertData = await sqlhelper.batch_insert('stores_qr_code', insertBatch, (err, res) => {
                    if (err) {
                        return callback(err, new Array());
                    } else {
                        return res.insertId;
                    }
                });

            }
        });
    } catch (err) {
        callback(err, new Array());
    }
}

// set delivered status if schedule push notification sent
cronJobModule.changeDeliveredStatusCron = () => {
    try {
        // At every 5th minute.
        cron.schedule('*/5 * * * *', async () => {

            var currentDateTime = moment().format('YYYY:MM:DD HH:mm')
           
            let getDataQuery = `SELECT push_notification_id,status FROM notifications_push WHERE is_schedule =1 AND status=2 AND sent_at < ?`
            let payload = await sqlhelper.select(getDataQuery, [currentDateTime], (err, res) => {
                if(err)
                {
                    return err;
                }
                else {
                    res.forEach(row => {
                        row.status = 1
                    })
                    return res;
                }
            });
            
            if (_.isEmpty(payload)) {
                return '';
            }
            sqlhelper.batch_update('notifications_push', payload, 'push_notification_id', (err, res) =>{
                if (err) {
                    return err;
                } else {
                    return res;
                }
            });
        });
    } catch (error) {
        return error;
    }
}

//  delete 6 months old notification..
cronJobModule.deleteNotificationCronJob = () => {
    try {
        // At 12:00.
        cron.schedule('0 12 * * *', async () => {
            var currentdate = new Date();
            var created_at = new Date(currentdate.setMonth(currentdate.getMonth()-6));

            let query = "DELETE FROM notifications WHERE created_at < ?";
            await sqlhelper.select(query, [created_at], (err, res) => {
                if (err) {
                    return err;
                } else {
                    return res;
                }
            });
        });
    } catch (error) {
        return error;
    }
}

//  delete 1 months old trashed mail..
cronJobModule.deleteTrashedEmails = () => {
    try {
        // At 12:00.
        cron.schedule('0 12 * * *', async () => {             
            let currentdate = new Date();
            let lastmonth = new Date(currentdate.setMonth(currentdate.getMonth()-1));
            let where ={
                status: 2,
                deleted_at: lastmonth
            }

            let query = "DELETE FROM mail WHERE status =? AND deleted_at < ?";
            await sqlhelper.select(query, [where.status, where.deleted_at], (err, res) => {
                if (err) {
                    return err;
                } else {
                  return res;
                }
            });
        });
    } catch (error) {
        return error;
    }
}

cronJobModule.storeOpenCloseStatusCron = () =>{
    try {
        // At every 5th minute.
        cron.schedule('*/5 * * * *', async () => {
            var currentTime = moment();
            var to_date = currentTime.format('YYYY:MM:DD');
            var to_time = currentTime.format('HH:mm');
         
            let getDataQuery = `SELECT store_time_status_id FROM stores_time_status WHERE status IN (2,3) AND to_date <= ? AND to_time <=?`;
            let payload = await sqlhelper.select(getDataQuery, [to_date,to_time], (err, res) => {
                if(err)
                {
                    return err;
                }
                else {
                    res.forEach(row => {
                        row.status = 1,
                        row.re_open = 1
                    })
                    return res
                }
            });
            if (_.isEmpty(payload)) {
                return '';
            }
            sqlhelper.batch_update('stores_time_status', payload, 'store_time_status_id', (err, res) =>{
                if (err) {
                    return err;
                } else {
                    return res;
                }
            });
        })
    } catch (error) {
        return error;
    }
}

module.exports = cronJobModule;