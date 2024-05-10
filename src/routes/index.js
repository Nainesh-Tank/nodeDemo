const router = require('express').Router();
const Version1 = require('./route.v1');
const Cronjob = require('./cron_job');

router.use('/v1', Version1);
router.use('/', Cronjob);

module.exports = router;