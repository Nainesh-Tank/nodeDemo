const dotenv = require('dotenv');
const path = require('path');

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
const envFound = dotenv.config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`) });

console.log(`===== Environment : ${process.env.NODE_ENV} =====`);
if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
} 
const config = {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 4000,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    DB_host: process.env.DB_host,
    DB_user: process.env.DB_user,
    DB_password: process.env.DB_password,
    DB_database: process.env.DB_database,
    DB_port: process.env.DB_port,
    Cripto_Key: process.env.Cripto_Key,
    Cripto_iv: process.env.Cripto_iv,
    Admin_OneSignalAPP_ID:process.env.Admin_OneSignalAPP_ID,
    Admin_OneSignalAPI_KEY:process.env.Admin_OneSignalAPI_KEY,
    Store_OneSignalAPP_ID:process.env.Store_OneSignalAPP_ID,
    Store_OneSignalAPI_KEY:process.env.Store_OneSignalAPI_KEY,
    User_OneSignalAPP_ID:process.env.User_OneSignalAPP_ID,
    User_OneSignalAPI_KEY:process.env.User_OneSignalAPI_KEY,
    Telecaller_OneSignalAPP_ID:process.env.Telecaller_OneSignalAPP_ID,
    Telecaller_OneSignalAPI_KEY:process.env.Telecaller_OneSignalAPI_KEY,
    Admin_FireBase_Key:process.env.Admin_FireBase_Key,
    Store_FireBase_Key:process.env.Store_FireBase_Key,
    Telecaller_FireBase_Key:process.env.Telecaller_FireBase_Key,
    User_FireBase_Key:process.env.User_FireBase_Key,
    mail_host: process.env.mail_host,
    mail_port: process.env.mail_port,
    mail_username: process.env.mail_username,
    mail_password: process.env.mail_password,
}
module.exports = { config };