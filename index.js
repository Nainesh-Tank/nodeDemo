const express = require('express');
const routes = require('./src/routes/index');
const { config } = require('./config/index');
const app = express();
const bodyParser = require('body-parser')
var path = require('path');
const cors = require('cors');

var multer = require('multer');
var upload = multer();
global.__basedir = __dirname;
global.__frontLink = 'https://dev.bharat_lgd.in/';
app.use('/assets/uploads', express.static('assets/uploads'));
app.use('/assets/exportData', express.static('assets/exportData'));
app.use('/assets/sampleFiles', express.static('assets/sampleFiles'));
// app.use(express.static(path.join(__dirname, 'assets')));


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    extended: true
}, { limit: '50mb' }));


// app.use(upload.any());

app.use(cors({ origin: true }));

app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

app.use(`/api`, routes);

const PORT = config.PORT;
app.listen(PORT, () => console.log(`server listening on port: ${PORT}`));

process.on('uncaughtException', function (err) {
    console.error("Uncaught exception occurred, Node NOT Exiting...", err.stack);
});
