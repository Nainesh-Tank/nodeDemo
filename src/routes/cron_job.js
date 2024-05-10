const router = require("express").Router();


//  cron job
// const customCron = require('../models/cron_job.model');
// customCron.changeDeliveredStatusCron();
// customCron.deleteNotificationCronJob();
// customCron.deleteTrashedEmails();
// customCron.storeOpenCloseStatusCron();


router.all("*", (req, res) => {
  return res.status(400).send({ status: false, message: "Invalid URL" });
});
module.exports = router;
