const { config } = require("./index");
const dbConfig = {
    host: config.DB_host,
    user: config.DB_user,
    password: config.DB_password,
    database: config.DB_database,
    port: config.DB_port
}
const mysql = require("mysql");

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// open the MySQL connection
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

module.exports = connection;
module.exports.dbConfig = dbConfig;