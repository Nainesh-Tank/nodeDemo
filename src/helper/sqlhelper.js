const sqlred = require("../../config/read.db");
const _ = require("lodash");

const SqlHelper = function (sqlhelper) {
  this.Device_Name = sqlhelper.Device_Name;
};

SqlHelper.select = async (query, data_array = [], callback) => {
  return new Promise((resolve) => {
    var sql_data = sqlred.query(query, data_array, (err, res) => {
      if (err) {
        return resolve(callback(err, ""));
      } else {
        return resolve(callback("", res));
      }
    });
    // console.log("====================================\n"); 
    // console.log(sql_data.sql);
  });
};
SqlHelper.insert = async (table_name, insert_data = {}, callback) => {
  return new Promise((resolve) => {
    var sql_data = sqlred.query(
      "INSERT INTO " + table_name + " SET ?",
      insert_data,
      (err, res) => {
        if (err) {
          return resolve(callback(err, ""));
        } else {
          return resolve(callback("", res));
        }
      }
    );
    // console.log(sql_data.sql);
  });
};

SqlHelper.batch_insert = async (table_name, insert_data = [], callback) => {
  let data_key = Object.keys(insert_data[0]);
  let data_array = insert_data.map((obj) => data_key.map((key) => obj[key]));

  let sql =
    "INSERT INTO " + table_name + " (" + data_key.join(",") + ") VALUES ?";
  return new Promise((resolve) => {
    var sql_data = sqlred.query(sql, [data_array], (err, res) => {
      if (err) {
        return resolve(callback(err, ""));
      } else {
        return resolve(callback("", res));
      }
    });
    //  console.log(sql_data.sql);
  });
};

SqlHelper.update = async (
  table_name,
  update_data = {},
  where = {},
  callback
) => {
  let update_key = Object.keys(update_data);
  update_key = update_key.join("=?, ");
  update_key = update_key != "" ? update_key + "=?" : "";

  let where_key = Object.keys(where);
  where_key = where_key.join("=? AND ");
  where_key = where_key != "" ? " AND " + where_key + "=? " : "";

  update_data = Object.values(update_data);
  _.each(where, (wVal, wKey) => {
    update_data.push(wVal);
  });

  return new Promise((resolve) => {
    var sql_data = sqlred.query(
      "UPDATE " + table_name + " SET " + update_key + " WHERE 1 " + where_key,
      update_data,
      (err, res) => {
        if (err) {
          return resolve(callback(err, ""));
        } else {
          return resolve(callback("", res));
        }
      }
    );
  });
};

SqlHelper.batch_update = async (
  table_name = "",
  update_data = [],
  where_key = "",
  callback
) => {
  var promises = [];
  for (let i = 0; i < update_data.length; i++) {
    let tmp_data = update_data[i];
    if (where_key.toString() in tmp_data) {
      let where_val = tmp_data[where_key];
      delete tmp_data[where_key];

      let update_key = Object.keys(tmp_data);
      update_key = update_key.join("=?, ");
      update_key = update_key != "" ? update_key + "=?" : "";

      let update_val = Object.values(tmp_data);
      update_val.push(where_val);

      var promise = new Promise((resolve, reject) => {
        let query =
          "UPDATE " +
          table_name +
          " SET " +
          update_key +
          " WHERE " +
          where_key +
          "=? ";
        let sql_data = sqlred.query(query, update_val, (err, res) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(res);
          }
        });
        // console.log(sql_data.sql);
      });
      promises.push(promise);
    }
  }
  if (promises.length > 0) {
    Promise.all(promises)
      .then(function (data) {
        callback("", data);
      })
      .catch(function (err) {
        console.log(err.stack);
        callback(err, "");
      });
  }
};

module.exports = SqlHelper;
