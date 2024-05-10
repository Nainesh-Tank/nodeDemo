const _ = require("lodash");
const encryptionhelper = require("../helper/encryption");
const moment = require("moment");
const sqlhelper = require("../helper/sqlhelper");
const validation = require("../middleware/validation");
const uploadHelper = require("../helper/uploadFile");
const { jwtBlocklist } = require("../middleware/auth");
const { sendFireBaseNotification, sendOneSignalNotification } = require("../helper/notification");
const { logout_log, getImageBase64, menu_permission } = require("../helper/common");
const path = require("path");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const fs = require("fs");
const axios = require("axios");

const adminLedgerModule = function (adminLedger) {
  this.Device_Name = adminLedger.Device_Name;
};
adminLedgerModule.logout = async (req, callback) => {
  try {
    await logout_log(req.user.session_id, req.user.admin_ledger_id, 1);
    await jwtBlocklist(req);
    callback(null, { errorCode: 200, status: true, message: "Logout successfully" });
  } catch (err) {
    callback(err, new Array());
  }
};
adminLedgerModule.onesignal = async (req, callback) => {
  try {
    const { body } = req;
    const payload = {
      notification_player_id: body.notification_player_id,
      updated_by: req.user.admin_ledger_id,
      updated_ip: req.user.ipAddress,
      updated_at: new Date(),
    };

    let where_data = {
      admin_ledger_id: req.user.admin_ledger_id,
    };

    await sqlhelper.update("admin_ledger", payload, where_data, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        callback(null, { errorCode: 200, status: true, message: "Player Id updated successfully" });
      }
    });
  } catch (err) {
    callback(err, new Array());
  }
};
adminLedgerModule.login = async (req, callback) => {
  try {
    const { body } = req;
    const user_type = 1;
    body.username = encryptionhelper.encryptResponse(body.username);
    const validateResponse = await validation.validate_login(body);
    if (validateResponse) {
      return callback(null, validateResponse);
    }
    //check Geolocation
    const device_details = JSON.parse(body.device_details);
    if (_.isEmpty(device_details.latitude) && _.isEmpty(device_details.longitude)) {
       return callback(null, {errorCode: 401,status: false,message:"You are not authorized to login into system. Please enable your Geolocation services to login"});
    }
    // ===================

    //check IP block or not
    let checkIP = 'SELECT log_login_id FROM log_login WHERE ip_address = ? AND is_block = 1 AND user_type IN('+user_type+')';
    var isIPBlock = await sqlhelper.select(checkIP, [device_details.ipAddress], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res;
      }
    });

    if (isIPBlock.length > 0) {
     return callback(null, {errorCode: 403,status: false,message:"Sorry! The IP through which you are trying to logged in is block. Please contact Administrator to get this issue solved"});
    }
    const baseImageUrl = `http://${req.hostname}:${process.env.PORT}/`;

    let loginQuery = `SELECT al.admin_ledger_id,al.role_id,role.name as role_name,al.first_name,al.last_name,al.code,al.device_token_id,al.notification_player_id,al.created_at,al.updated_at,
                            CASE
                                WHEN al.image IS NOT NULL AND al.image != '' THEN CONCAT('${baseImageUrl}', al.image)
                                ELSE ''
                            END AS image 
                          FROM admin_ledger as al
                          INNER JOIN role ON al.role_id = role.role_id AND role.user_type = 1
                          WHERE (al.username=? OR al.email=?) AND al.password=? AND al.is_active=1 AND role.user_type IN(?)`;

    var userdata = await sqlhelper.select(loginQuery, [body.username,body.username,md5(body.password),user_type], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        res.forEach((row) => {
          row.code = encryptionhelper.decryptResponse(row.code);
          row.first_name = encryptionhelper.decryptResponse(row.first_name);
          row.last_name = encryptionhelper.decryptResponse(row.last_name);
        });
        return res[0];
      }
    });

    if (_.isEmpty(userdata)) {
      return callback(null, {errorCode: 401,status: false,message: "⚠️ Username or password invalid ⚠️"});
    } else {

      await logout_log(body.session_id, userdata.admin_ledger_id,1);
      
      let adminActivity = {
        user_type: user_type,
        admin_ledger_id: userdata.admin_ledger_id,
        session_id: device_details.deviceId,
        ip_address: device_details.ipAddress,
        latitude: device_details.latitude,
        longitude: device_details.longitude,
        device_type: device_details.device_type ? device_details.device_type : 1,
        device_details: body.device_details,
        browser_details: (device_details.browser)?device_details.browser:'',
        login_at: new Date(),
        is_login: 1,
      };
      await sqlhelper.insert("log_login", adminActivity, (err, res) => {
        if (err) {
          return callback(err, new Array());
        } else {
          return res;
        }
      });
      userdata.session_id = device_details.deviceId;
      userdata.user_type = body.user_type;

      const tokenExpiration = "10000h"; // Token expires in 5 hour
      const secretKey = process.env.JWT_SECRET_KEY; // Secret key from environment variable

      const token = jwt.sign(
        {
          admin_ledger_id: userdata.admin_ledger_id,
          role_id: userdata.role_id,
          user_type: user_type,
          device_type: device_details.device_type,
          role_name: userdata.role_name,
          code: userdata.code,
          image: userdata.image,
          first_name: userdata.first_name,
          last_name: userdata.last_name,
          created_at: userdata.created_at,
          session_id: userdata.session_id,
          ipAddress: device_details.ipAddress,
        },
        secretKey,
        {
          expiresIn: tokenExpiration,
        }
      );
      let loginData = userdata;
      loginData.token = token;
      const getMenu = await menu_permission(userdata.admin_ledger_id);

      loginData.permission_list = getMenu.permission_list;
      loginData.menu_list = getMenu.menu_list;

      const payloadNoti = {
        sent_from: 1, //1=LMG,2=Store,3=User,4=Suppport
        sent_to: user_type,//1=LMG,2=Store,3=User,4=Suppport
        screen: "",
        title: "Login Successfully",
        description: userdata.first_name + " loged in successfully",
        is_redirect: 0,
        include_player_ids: userdata.notification_player_id,
      };
      
      await sendOneSignalNotification(payloadNoti);
      // await sendFireBaseNotification(userdata.device_token_id,payloadNoti);

      callback(null, {errorCode: 200,status: true, message: "success",data: loginData});
    }
  } catch (err) {
    callback(err, new Array());
  }
};
adminLedgerModule.changePassword = async (req, callback) => {
  try {
    const { body } = req;
    const validateResponse = await validation.validate_changePassword(req.body);
    if (validateResponse) {
      return callback(null, validateResponse);
    }
    if (body.new_password !== body.confirm_password) {
      return callback(null, {errorCode: 400,status: false,message: "Password do not match"});
    }

    let CheckAdmin = 'SELECT admin_ledger_id FROM admin_ledger WHERE admin_ledger_id=? AND password=? AND is_active=1';
    var userdata = await sqlhelper.select(CheckAdmin, [req.user.admin_ledger_id,md5(body.current_password)], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res;
      }
    });

    if (_.isEmpty(userdata)) {
      return callback(null, {errorCode: 400,status: false,message: "Password does not match!"});
    }

    const payload = {
      password: md5(body.new_password),
      password_show: body.new_password,
      updated_by: req.user.admin_ledger_id,
      updated_ip: req.user.ipAddress,
      updated_at: new Date(),
    };

    let where_data = {
      admin_ledger_id: req.user.admin_ledger_id,
    };

    await sqlhelper.update("admin_ledger", payload, where_data, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        callback(null, { errorCode: 200, status: true, message: "Password updated successfully" });
      }
    });
  } catch (err) {
    callback(err, new Array());
  }
};
adminLedgerModule.addAdminLedger = async (req, callback) => {
  try {
    const { files, body } = req;
    const validateResponse = await validation.validate_addAdminLedger(req.body);
    if (validateResponse) {
      return callback(null, validateResponse);
    } 

    body.username = encryptionhelper.encryptResponse(body.username.trim());
    body.email = encryptionhelper.encryptResponse(body.email.trim());
    body.code = encryptionhelper.encryptResponse(body.code.trim());
    body.first_name = encryptionhelper.encryptResponse(body.first_name.trim());
    body.last_name = encryptionhelper.encryptResponse(body.last_name.trim());
    body.phone = encryptionhelper.encryptResponse(body.phone.trim());
    body.address = encryptionhelper.encryptResponse(body.address.trim());
    
    let checkAdminExistQuery = 'SELECT username,email,code FROM admin_ledger';
    let getAdmin = await sqlhelper.select(checkAdminExistQuery, [], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res;
      }
    });

    const isUsernameExists = getAdmin.some(item => item.username === body.username);
    if (isUsernameExists) {
      return callback(null, {errorCode: 400,status: false,message: `Username already exists`});
    } 

    const isEmailExists = getAdmin.some(item => item.email === body.email);
    if (isEmailExists) {
      return callback(null, {errorCode: 400,status: false,message: `Email already exists`});
    } 

    const isCodeExists = getAdmin.some(item => item.code === body.code);
    if (isCodeExists) {
      return callback(null, {errorCode: 400,status: false,message: `Code already exists`});
    }
    
    const payload = {
      role_id: body.role_id,
      code: body.code,
      image: files.image
        ? "assets/uploads/adminLedger/" + files.image[0].filename
        : "",
      first_name: body.first_name,
      last_name: body.last_name,
      username: body.username,
      email: body.email,
      password: md5(body.password),
      password_show: body.password,
      phone: body.phone,
      gender: body.gender,
      address: body.address,
      created_by: req.user.admin_ledger_id,
      created_ip: req.user.ipAddress,
      updated_at: new Date(),
    };
    await sqlhelper.insert("admin_ledger", payload, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        callback(null, { errorCode: 200, status: true, message: "Admin Ledger added successfully" });
      }
    });
  } catch (err) {
    callback(err, new Array());
  }
}; 
adminLedgerModule.updateAdminLedger = async (req, callback) => {
  try {
    const { files, body, params } = req;
    const validateResponse = await validation.validate_updateAdminLedger(req.body);
    if (validateResponse) {
      return callback(null, validateResponse);
    }

    let checkData = 'SELECT admin_ledger_id,image FROM admin_ledger WHERE admin_ledger_id=?';
    let getData = await sqlhelper.select(checkData, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res[0];
      }
    });
    if (_.isEmpty(getData)) {
      return callback(null, {errorCode: 400,status: false,message: "Data not exists"});
    }

    body.username = encryptionhelper.encryptResponse(body.username.trim());
    body.email = encryptionhelper.encryptResponse(body.email.trim());
    body.code = encryptionhelper.encryptResponse(body.code.trim());
    body.first_name = encryptionhelper.encryptResponse(body.first_name.trim());
    body.last_name = encryptionhelper.encryptResponse(body.last_name.trim());
    body.phone = encryptionhelper.encryptResponse(body.phone.trim());
    body.address = encryptionhelper.encryptResponse(body.address.trim());

    let checkAdminExistQuery = 'SELECT username,email,code FROM admin_ledger WHERE admin_ledger_id!= ?';
    let getAdmin = await sqlhelper.select(checkAdminExistQuery, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res;
      }
    });

    const isUsernameExists = getAdmin.some(item => item.username === body.username);
    if (isUsernameExists) {
      return callback(null, {errorCode: 400,status: false,message: `Username already exists`});
    } 

    const isEmailExists = getAdmin.some(item => item.email === body.email);
    if (isEmailExists) {
      return callback(null, {errorCode: 400,status: false,message: `Email already exists`});
    } 

    const isCodeExists = getAdmin.some(item => item.code === body.code);
    if (isCodeExists) {
      return callback(null, {errorCode: 400,status: false,message: `Code already exists`});
    } 
   
    var imageLink;
    if (_.isEmpty(files)) {
      imageLink = getData.image;
    } else {
      // old unlink
      const filePathsObject = [
        { destination: "assets/uploads/adminLedger/", filename: getData.image },
      ];
      uploadHelper.unlinkFiles(filePathsObject);
      imageLink = "assets/uploads/adminLedger/" + files.image[0].filename;
    }
    const payload = {
      role_id: body.role_id,
      code: body.code,
      image: imageLink,
      first_name: body.first_name,
      last_name: body.last_name,
      username: body.username,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      address: body.address,
      updated_by: req.user.admin_ledger_id,
      updated_ip: req.user.ipAddress,
      updated_at: new Date(),
    };

    let where_data = {
      admin_ledger_id: params.admin_ledger_id,
    };
    await sqlhelper.update("admin_ledger", payload, where_data, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        callback(null, { errorCode: 200, status: true, message: "Admin Ledger updated successfully" });
      }
    });
  } catch (err) {
    callback(err, new Array());
  }
};
adminLedgerModule.deleteAdminLedger = async (req, callback) => {
  try {
    const { params } = req;
    let checkData = 'SELECT admin_ledger_id,image FROM admin_ledger WHERE admin_ledger_id=?';
    let getData = await sqlhelper.select(checkData, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res[0];
      }
    });
    if (_.isEmpty(getData)) {
      return callback(null, {errorCode: 400,status: false,message: "Data not exists"});
    }
    let query = "DELETE FROM admin_ledger WHERE admin_ledger_id=?";
    await sqlhelper.select(query, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else if (res.affectedRows <= 0) {
        return callback(null, {errorCode: 400,status: false,message: "Data not found"});
      } else {
        const filePathsObject = [
          { destination: "assets/uploads/adminLedger/", filename: getData.image },
        ];
        uploadHelper.unlinkFiles(filePathsObject);
        callback(null, { errorCode: 200, status: true, message: "Admin Ledger deleted successfully" });
      }
    });
  } catch (err) {
    callback(err, new Array());
  }
};
adminLedgerModule.updateStatus = async (req, callback) => {
  try {
    const { params } = req;

    let checkId = 'SELECT admin_ledger_id FROM admin_ledger WHERE admin_ledger_id=?';
    let getId = await sqlhelper.select(checkId, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res;
      }
    });
    if (_.isEmpty(getId)) {
      return callback(null, {errorCode: 400,status: false,message: "Data not exists"});
    }

    const updateQuery ="UPDATE admin_ledger SET is_active = 1-is_active WHERE admin_ledger_id = ?";
    await sqlhelper.select(updateQuery, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        callback(null, {errorCode: 200,status: true,message: "Status updated successfully"});
      }
    });
  } catch (err) {
    callback(err, new Array());
  }
}; 
adminLedgerModule.listAdminLedger = async (req, callback) => {
  try {
    var where = " WHERE 1";
    const queryParams = [];
    const { search, code, role_id, gender, first_name, last_name, username, email, phone, date, is_active, limit = 10, page = 1 } = req.query;

    if (search) {
      const searchData = encryptionhelper.encryptResponse(search);
      where += ` AND (al.code LIKE ? OR al.email LIKE ? OR al.first_name LIKE ? OR al.last_name LIKE ? OR al.username LIKE ? OR al.phone LIKE ?)`;
      queryParams.push(`%${searchData}%`, `%${searchData}%`, `%${searchData}%`, `%${searchData}%`, `%${searchData}%`, `%${searchData}%`);
    }
    if (code) {
      const flt_code = encryptionhelper.encryptResponse(code);
      where += ` AND al.code LIKE ?`;
      queryParams.push(`%${flt_code}%`);
    }
    if (first_name) {
      const flt_first_name = encryptionhelper.encryptResponse(first_name);
      where += ` AND al.first_name LIKE ?`;
      queryParams.push(`%${flt_first_name}%`);
    }
    if (last_name) {
      const flt_last_name = encryptionhelper.encryptResponse(last_name);
      where += ` AND al.last_name LIKE ?`;
      queryParams.push(`%${flt_last_name}%`);
    }
    if (username) {
      const flt_username = encryptionhelper.encryptResponse(username);
      where += ` AND al.username LIKE ?`;
      queryParams.push(`%${flt_username}%`);
    }
    if (email) {
      const flt_email = encryptionhelper.encryptResponse(email);
      where += ` AND al.email LIKE ?`;
      queryParams.push(`%${flt_email}%`);
    }
    if (phone) {
      const flt_phone = encryptionhelper.encryptResponse(phone);
      where += ` AND al.phone LIKE ?`;
      queryParams.push(`%${flt_phone}%`);
    }
    if (date) {
      const dateRange = date.split(" - ");
      const fromDate = moment(dateRange[0], "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
      const toDate = moment(dateRange[1], "DD-MM-YYYY").format("YYYY-MM-DD 23:59:59");

      where += ` AND al.created_at BETWEEN ? AND ?`;
      queryParams.push(fromDate, toDate);
    }
    if (role_id) {
      where += ` AND al.role_id =?`;
      queryParams.push(role_id);
    }
    if (gender) {
      where += ` AND al.gender =?`;
      queryParams.push(gender);
    }
    if (is_active) {
      where += ` AND al.is_active =?`;
      queryParams.push(is_active);
    }
    let orderBy = ` ORDER BY al.admin_ledger_id DESC`;

    const offset = (page - 1) * limit;
    const baseImageUrl = `http://${req.hostname}:${process.env.PORT}/`;

    const finalquery = `SELECT al.*,role.name as role_name,
                            CASE
                                WHEN al.image IS NOT NULL AND al.image != '' THEN CONCAT('${baseImageUrl}', al.image)
                                ELSE ''
                            END AS image
                            FROM admin_ledger as al 
                            INNER JOIN role ON role.role_id = al.role_id
                            ${where} ${orderBy} LIMIT ${limit} OFFSET ${offset} `;
                           
    let dataList = await sqlhelper.select(finalquery, queryParams, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
          res.forEach(row => {
              row.code = encryptionhelper.decryptResponse(row.code);
              row.first_name = encryptionhelper.decryptResponse(row.first_name);
              row.last_name = encryptionhelper.decryptResponse(row.last_name);
              row.username = encryptionhelper.decryptResponse(row.username);
              row.email = encryptionhelper.decryptResponse(row.email);
              row.phone = encryptionhelper.decryptResponse(row.phone);
              row.address = encryptionhelper.decryptResponse(row.address);
          });
          return res;
      }
    });
    
    const countQuery = `SELECT al.admin_ledger_id 
                            FROM admin_ledger as al
                            INNER JOIN role ON role.role_id = al.role_id
                            ${where}`;
    let dataCount = await sqlhelper.select(countQuery,queryParams, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res.length;
      }
    });
  
    if (_.isEmpty(dataList)) {
      return callback(null, { errorCode: 200, status: false, message: "You haven't added any data for the current filters" });
    } else {
      callback(null, { errorCode: 200, status: true, message: "Listed successfully", data: dataList, total: dataCount, whereIn: where, whereArr: JSON.stringify(queryParams) });
    }
  } catch (err) {
    callback(err, new Array());
  }
}; 
adminLedgerModule.exportAdminLedger = async (req, callback) => {
  try {
    const { admin_ledger_ids, whereIn,whereArr } = req.query;
    const baseImageUrl = `http://${req.hostname}:${process.env.PORT}/`;
    var where = " WHERE 1";
    let queryParams = [];
    
    if (admin_ledger_ids != undefined && admin_ledger_ids != "") {
      // const admin_ledger_id = admin_ledger_ids.join(",");
      
      // where += ` AND al.admin_ledger_id IN(${admin_ledger_id})`;
      where += ` AND al.admin_ledger_id IN(?)`;
      queryParams.push(admin_ledger_ids);
    } else {
      queryParams = JSON.parse(whereArr);
      where = whereIn;
    } 

    let checkId = `SELECT al.*,role.name as role_name,
                            CASE
                                WHEN al.image IS NOT NULL AND al.image != '' THEN CONCAT('${baseImageUrl}', al.image)
                                ELSE ''
                            END AS image 
                        FROM admin_ledger as al
                        INNER JOIN role ON role.role_id = al.role_id
                       ${where} ORDER BY admin_ledger_id DESC`;
    let getData = await sqlhelper.select(checkId,queryParams, (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        res.forEach((row) => {
          row.code = encryptionhelper.decryptResponse(row.code);
          row.first_name = encryptionhelper.decryptResponse(row.first_name);
          row.last_name = encryptionhelper.decryptResponse(row.last_name);
          row.username = encryptionhelper.decryptResponse(row.username);
          row.email = encryptionhelper.decryptResponse(row.email);
          row.phone = encryptionhelper.decryptResponse(row.phone);
          row.address = encryptionhelper.decryptResponse(row.address);
        });

        return res;
      }
    });

    if (_.isEmpty(getData)) {
      return callback(null, {errorCode: 400,status: false,message: "Data not exists"});
    }

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Admin Ledger");

    // Add data to the Excel sheet
    worksheet.columns = [
      // Define columns based on your fetched data structure
      { header: "Image", key: "column1", width: 10 },
      { header: "Role", key: "column2", width: 15 },
      { header: "Code", key: "column3", width: 15 },
      { header: "First Name", key: "column4", width: 15 },
      { header: "Last Name", key: "column5", width: 15 },
      { header: "Gender", key: "column6", width: 15 },
      { header: "Username", key: "column7", width: 15 },
      { header: "Email", key: "column8", width: 25 },
      { header: "Phone Number", key: "column9", width: 15 },
      { header: "Address", key: "column10", width: 25 },
      { header: "Is Active?", key: "column11", width: 10 },
      { header: "Created Date", key: "column12", width: 20 },
    ];

    // Get the header row and customize its style
    const headerRow = worksheet.getRow(1); // Assuming headers are in the first row
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "412213" }, // Specify the color here, this is red as an example
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }, // Specify the font color
      };
    });

    // Add rows to the worksheet
    for (let index = 0; index < getData.length; index++) {
      const row = getData[index];

      worksheet.addRow({
        column1: "",
        column2: row.role_name,
        column3: row.code,
        column4: row.first_name,
        column5: row.last_name,
        column6: row.gender == 1 ? "Male" : "Female",
        column7: row.username,
        column8: row.email,
        column9: row.phone,
        column10: row.address,
        column11: {
          richText: [
            {
              text: row.is_active == 1 ? "Active" : "InActive",
              font: {
                bold: true,
                color: { argb: row.is_active == 1 ? "11890F" : "FF0000" },
              },
            },
          ],
        },
        column12: moment(row.created_at).format("YYYY-MM-DD HH:mm:ss"),
      });

      if (row.image) {
        const image = workbook.addImage({
          base64: await getImageBase64(row.image), // Function to get image base64 (implement this)
          extension: "png",
        });
        const imageWidth = 60;
        const imageHeight = 60;
        worksheet.addImage(image, {
          tl: { col: 0, row: index + 1 }, // Adjust col and row accordingly
          ext: { width: imageWidth, height: imageHeight }, // Adjust image size as needed
        });
        worksheet.getRow(index + 2).height = Math.floor(imageHeight * 0.75);
      }
    }

    // Save the workbook to a file
    const destination = "assets/exportData/admin_ledger_exported_data.xlsx";
    const filePath = path.join(__basedir, destination);
    // const filePath = 'assets/exportData/admin_ledger_exported_data.xlsx';
    workbook.xlsx
      .writeFile(filePath)
      .then(() => {
        // Set response headers for Excel file download
        const file = fs.createReadStream(filePath);

        callback(null, {errorCode: 200,status: true,message: "Data exported successfully",data: `${baseImageUrl}${destination}`});
      })
      .catch((error) => {
        callback(null, { errorCode: 400, status: false, message: "Error exporting data to Excel" });
      });
  } catch (err) {
    callback(err, new Array());
  }
};

// // User IP Address Adding.

// adminLedgerModule.addAdminIP = async (req, callback) => {
//   try {
//     const { body } = req;
//     const validateResponse = await validation.validate_addAdminIP(req.body);
//     if (validateResponse) {
//       return callback(null, validateResponse);
//     }
        
//     let checkAdminLedgerIdQuery = 'SELECT admin_ledger_id FROM admin_ledger WHERE admin_ledger_id=?';
//     let getAdmin = await sqlhelper.select(checkAdminLedgerIdQuery, [body.admin_ledger_id], (err, res) => {
//       if (err) {
//         return callback(err, new Array());
//       } else {
//         return res;
//       }
//     });

//     if (_.isEmpty(getAdmin)) {
//       return callback(null, {errorCode: 400,status: false,message: `User Id Not exists`});
//     }

//     let existingIPCheck = `SELECT ip_access FROM admin_security_group WHERE admin_ledger_id=? AND ip_access=?`;
//     let getExistingIP = await sqlhelper.select(existingIPCheck, [body.admin_ledger_id, body.ip_access], (err, res) => {
//       if (err) {
//         return callback(err, new Array());
//       } else {
//         return res;
//       }
//     });

//     if(!_.isEmpty(getExistingIP))
//     {
//       return callback(null, { errorCode: 400, status: false, message: 'User IP already exists'});
//     }

//     const payload= {
//       admin_ledger_id: body.admin_ledger_id,
//       ip_access: body.ip_access,
//       description: body.description,
//       status: body.status,
//       created_at: new Date(),
//       created_by: req.user.admin_ledger_id,
//       created_ip: req.user.ipAddress,
//     }

//     await sqlhelper.insert("admin_security_group", payload, (err, res) =>{
//       if(err)
//       {
//         return callback(err, new Array());
//       }
//       else {
//         return callback(null, { errorCode: 200, status: true, message: `User Ip details added successfully` });
//       }
//     });
//   } catch (err) {
//     callback(err, new Array());
//   }
// }

// adminLedgerModule.updateAdminIP = async (req, callback) => {
//   try {
//     const { body, params } = req;
//     const validateResponse = await validation.validate_updateAdminIp(req.body);
//     if(validateResponse)
//     {
//       return callback(null, validateResponse);
//     }

//     let checkId = 'SELECT admin_security_group_id FROM admin_security_group WHERE admin_security_group_id=?'
//     let getId = await sqlhelper.select(checkId, [params.admin_security_group_id], (err, res) =>{
//       if(err)
//       {
//         return callback(err, new Array());
//       }
//       else {
//         return res;
//       }
//     });
    
//     if (_.isEmpty(getId))
//     {
//       return callback(null, {errorCode: 400, status: false, message: `Data Not Exist!`})
//     }

//     let checkExistQuery = `SELECT admin_security_group_id FROM admin_security_group WHERE admin_security_group_id!=? AND admin_ledger_id = ? AND ip_access = ?`;
//     let getData = await sqlhelper.select(checkExistQuery, [params.admin_security_group_id, body.admin_ledger_id, body.ip_access], (err, res) => {
//       if(err)
//       {
//         return callback(err, new Array());
//       }
//       else {
//         return res;
//       }
//     });

//     if (getData.length > 0) {
//       return callback(null, { errorCode: 400, status: false, message: 'User details already exists'});
//     }

//     const payload = {
//       admin_ledger_id: body.admin_ledger_id,
//       ip_access: body.ip_access,
//       description: body.description,
//       status: body.status,
//       updated_by: req.user.admin_ledger_id,
//       updated_ip: req.user.ipAddress,
//       updated_at: new Date(),
//     }

//     let where_data = {
//       admin_security_group_id: params.admin_security_group_id,
//     };

//     await sqlhelper.update("admin_security_group", payload, where_data, (err, res) =>{
//       if(err)
//       {
//         return callback(err, new Array());
//       }
//       else {
//         return callback(null, {errorCode:200, status:true, message: `User data updated successfully.`});
//       }
//     });
//   }
//   catch(err)
//   {
//     callback(err, new Array());
//   }
// }

// adminLedgerModule.blockAdminIP = async (req, callback) => {
//   try {
//     const { params } = req;

//   const checkId = `SELECT admin_security_group_id FROM admin_security_group WHERE admin_security_group_id = ?`;
//   const getId = await sqlhelper.select(checkId, [params.admin_security_group_id], (err, res) =>{
//     if(err)
//     {
//       return callback(err, new Array());
//     }
//     else {
//       return res;
//     }
//   });

//   if(_.isEmpty(getId))
//   {
//     return callback(null, {errorCode: 400, status: false, message: `Data not found.`})
//   }
//   const updateQuery = 'UPDATE admin_security_group SET status = 1-status WHERE admin_security_group_id = ?';
//   await sqlhelper.select(updateQuery, [params.admin_security_group_id], (err, res) => {
//     if (err) {
//       return callback(err, new Array());
//     } else {
//       callback(null, {errorCode: 200,status: true,message: "User Status updated successfully"});
//     }
//   });
//   } catch (error) {
//     callback(error, new Array());
//   }
// }

// adminLedgerModule.ListAdminIP = async(req, callback) => {
//   try {
//     var where = ' WHERE 1';
//     const queryParams = [];
//     const {admin_ledger_id, ip_access } = req.query;

//     if(admin_ledger_id)
//     {
//       where += ` AND asg.admin_ledger_id=?`;
//       queryParams.push(admin_ledger_id)
//     }
//     if(ip_access)
//     {
//       where += ` AND asg.ip_access =?`;
//       queryParams.push(ip_access);
//     }
//     // if(status)
//     // {
//     //   where += `AND asg.status =?`;
//     //   queryParams.push(status);
//     // }
//     // if (created_at) {
//     //   const dateRange = created_at.split(' - ');
//     //   const fromDate = moment(dateRange[0], 'DD-MM-YYYY').format('YYYY-MM-DD 00:00:00');
//     //   const toDate = moment(dateRange[1], 'DD-MM-YYYY').format('YYYY-MM-DD 23:59:59');

//     //   where += ` AND asg.created_at BETWEEN ? AND ?`;
//     //   queryParams.push(fromDate, toDate)
//     // }    
//     let orderBy = `ORDER BY admin_ledger_id DESC`;

//     const finalquery = `SELECT al.role_id, al.first_name, al.last_name, asg.description, asg.created_at, asg.admin_ledger_id, 
//                         asg.admin_security_group_id, asg.ip_access, asg.status
//                         FROM admin_security_group as asg 
//                         INNER JOIN admin_ledger as au ON al.admin_ledger_id = asg.admin_ledger_id 
//                         ${where} ${orderBy}`;

//     let dataList = await sqlhelper.select(finalquery, queryParams, (err, res) => {
//       if (err) {
//         return callback(err, new Array());
//       } else {
//         res.forEach(row => {
//           row.first_name = encryptionhelper.decryptResponse(row.first_name);
//           row.last_name = encryptionhelper.decryptResponse(row.last_name);
//       });
//       return res;
//       }
//     });
    
//     if(_.isEmpty(dataList))
//     {
//       return callback(null, {errorCode:400, status: false, message: "Data Not Found"});
//     }
//     else {
//       return callback(null, {errorCode: 200, status:true, message: "Listed Successfully", data: dataList});
//     }
//   } catch (error) {
//     return callback(error, new Array());
//   }

// }

// adminLedgerModule.deleteAdminLedgerIP = async (req, callback) => {
//   try {
//     const { body } = req;
//     let checkData = 'SELECT admin_ledger_id, ip_access FROM admin_security_group WHERE admin_security_group_id=?';

//     let getData = await sqlhelper.select(checkData, [body.admin_security_group_id], (err, res) => {
//       if (err) {
//         return callback(err, new Array());
//       } else {
//         return res[0];
//       }
//     });

//     if (_.isEmpty(getData)) {
//       return callback(null, {errorCode: 400,status: false,message: "Data not exists"});
//     }
//     let query = "DELETE FROM admin_security_group WHERE admin_security_group_id=?";
//     await sqlhelper.select(query, [body.admin_security_group_id], (err, res) => {
//       if (err) {
//         return callback(err, new Array());
//       } else if (res.affectedRows <= 0) {
//         return callback(null, {errorCode: 400,status: false,message: "Data not found"});
//       } else {
//         callback(null, { errorCode: 200, status: true, message: "User IP deleted successfully" });
//       }
//     });
//   } catch (err) {
//     callback(err, new Array());
//   }
// };

// // ---------create sample partial search API-------------------------

// adminLedgerModule.CreateEncUser = async (req, callback) => {
//   try {
//     const { body } = req;

//     const validateResponse = await validation.validate_CreateEncUser(req.body);
//     if (validateResponse) {
//       return callback(null, validateResponse);
//     }

//     body.first_name = encryptionhelper.caesarCipherEncrypt(body.first_name.trim());
//     body.last_name = encryptionhelper.caesarCipherEncrypt(body.last_name.trim());

//     const payload ={
//       first_name: body.first_name,
//       last_name: body.last_name,
//       age: body.age
//     }

//     await sqlhelper.insert("user_search", payload, (err, res) =>{
//       if(err)
//       {
//         return callback(err, new Array());
//       }
//       else {
//         return callback(null, { errorCode: 200, status: true, message: `User details added successfully` });
//       }
//     });
//   } catch (error) {
//     return callback(error, new Array());
//   }
// };

// adminLedgerModule.searchPartialData = async (req, callback) => {
//   try {
//     var where = 'WHERE';
//     let queryParams = [];
//     let { first_name, last_name } = req.body;

//     if (first_name) {
//       where += ' first_name LIKE ? AND';
//       first_name = encryptionhelper.caesarCipherEncrypt(first_name)
//       queryParams.push(`%${first_name}%`);
//     }
//     if (last_name) {
//       where += ' last_name LIKE ? AND';
//       last_name = encryptionhelper.caesarCipherEncrypt(last_name)
//       queryParams.push(`%${last_name}%`);
//     }

//     if(_.isEmpty(queryParams))
//     {
//       return callback(null, {errorCode:400, status: false, message: "Empty Request"});
//     }
//     else {
//       where = where.slice(0, -3);
//       const finalquery = `SELECT * FROM user_search ${where} `;

//       let dataList = await sqlhelper.select(finalquery, queryParams, (err, res) => {
//         if (err) {
//           return callback(err, new Array());
//         } else {
//           res.forEach(row => {
//             row.first_name = encryptionhelper.cipherDecrypt(row.first_name);
//             row.last_name = encryptionhelper.cipherDecrypt(row.last_name);
//         });
//         return res;
//         }
//       });

//       if(_.isEmpty(dataList))
//       {
//         return callback(null, {errorCode:400, status: false, message: "Data Not Found"});
//       }
//       else {
//         return callback(null, {errorCode: 200, status:true, message: "Listed Successfully", data: dataList});
//       }

//     }
//   } catch (error) {
//     callback(error, new Array());
//   }
// }

adminLedgerModule.getAdminDetails = async (req, callback) => {
  try {
    let { params } = req;

    let checkData = 'SELECT admin_ledger_id,image FROM admin_ledger WHERE admin_ledger_id=?';
    let checkAdminData = await sqlhelper.select(checkData, [params.admin_ledger_id], (err, res) => {
      if (err) {
        return callback(err, new Array());
      } else {
        return res[0];
      }
    });
    if (_.isEmpty(checkAdminData)) {
      return callback(null, {errorCode: 400,status: false,message: "Data not exists"});
    }

    const baseImageUrl = `http://${req.hostname}:${process.env.PORT}/`;

    const finalQuery = `SELECT al.admin_ledger_id, al.role_id, al.code, al.first_name, al.last_name, al.address, al.username,al.gender, role.name as role_name, al.phone, al.email, al.is_active, al.created_at,
                      CASE
                        WHEN al.image IS NOT NULL AND al.image != '' THEN CONCAT('${baseImageUrl}', al.image)
                        ELSE ''
                      END AS image
                      FROM admin_ledger as al
                      INNER JOIN role ON role.role_id = al.role_id
                      WHERE al.admin_ledger_id = ?`;
  
  let getData = await sqlhelper.select(finalQuery, [params.admin_ledger_id], (err, res) => {
    if(err){
      return callback(err, new Array());
    } else {
      res.forEach((row) =>{
        row.code = encryptionhelper.decryptResponse(row.code);
        row.first_name = encryptionhelper.decryptResponse(row.first_name);
        row.last_name = encryptionhelper.decryptResponse(row.last_name);
        row.username = encryptionhelper.decryptResponse(row.username);
        row.phone = encryptionhelper.decryptResponse(row.phone);
        row.email = encryptionhelper.decryptResponse(row.email);
        row.address = encryptionhelper.decryptResponse(row.address);
      });
      return res[0];
    }
  });
  callback(null, { errorCode: 200, status: true, message: "success", data: getData});
  } catch (error) {
    callback(error, new Array());
  }
}

module.exports = adminLedgerModule;
