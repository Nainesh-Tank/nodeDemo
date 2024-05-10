const FCM = require("fcm-node");
const _ = require("lodash");
const axios = require("axios");
const { config } = require("../../config/index");
const sqlhelper = require("./sqlhelper");
// const userAgent = require('user-agent-parser');
function secondsToTime(seconds) {
  let ret = "";
  /* get the days */
  const days = Math.floor(seconds / (3600 * 24));
  if (days > 0) {
    ret += `${days} days `;
  }
  /* get the hours */
  const hours = Math.floor((seconds / 3600) % 24);
  if (hours > 0) {
    ret += `${hours} hours `;
  }
  /* get the minutes */
  const minutes = Math.floor((seconds / 60) % 60);
  if (minutes > 0) {
    ret += `${minutes} minutes `;
  }
  /* get the seconds */
  const remainingSeconds = Math.floor(seconds % 60);
  if (remainingSeconds > 0) {
    ret += `${remainingSeconds} seconds`;
  }
  return ret.trim(); // Remove trailing space before returning
}
// exports.watch_Log = async (req, api_name, description,status,is_error = 0, developed_by = "") => {
//   const ipAddress = req.ip || req.connection.remoteAddress;
//   const requestData = {
//     query: req.query,
//     body: req.body,
//     files: req.files,
//     params: req.params,
//     method: req.method,
//   };
//   const payload = {
//     user_type: (req.user)?req.user.user_type:0,
//     ledger_id: req.user ? req.user.admin_ledger_id : 0,
//     api_name: api_name.trim(),
//     description: description.trim(),
//     api_link: req.originalUrl.trim(),
//     request: JSON.stringify([requestData]),
//     device_type: 1,
//     status: status,
//     created_ip: ipAddress.trim(),
//     developed_by: developed_by,
//     is_error: is_error,
//   };
//   sqlhelper.insert("log_api", payload, (err, res) => {
//     if (err) {
//       // callback(err, new Array());
//       return 0;
//     } else {
//       return res;
//     }
//   });
//   return 1;
// };
exports.logout_log = async (session_id, ledger_id,user_type) => {
  let loginQuery = `SELECT admin_ledger_id,login_at,session_id
                      FROM log_login
                      WHERE user_type=? AND is_login=1 AND admin_ledger_id=? AND session_id=? ORDER BY admin_ledger_id DESC LIMIT 1`;

  var LoginData = await sqlhelper.select(loginQuery, [user_type,ledger_id,`${session_id}`], (err, res) => {
    if (err) {
      return 0;
    } else {
      return res[0];
    }
  });

  if (LoginData) {
    const currentDatetime = new Date();
    const loginDatetime = LoginData.login_at; // Login date and time in ISO format

    const timeDifferenceInSeconds = Math.abs(
      (currentDatetime - loginDatetime) / 1000
    );
    const total_activity = secondsToTime(timeDifferenceInSeconds);

    let updateActivityPayload = {
      total_activity: total_activity,
      logout_by: ledger_id,
      logout_at: new Date(),
      is_login: 0,
    };

    let where_data = {
      user_type: user_type,
      session_id: session_id.trim(),
      is_login: 1,
      admin_ledger_id: ledger_id,
    };
    await sqlhelper.update("log_login",updateActivityPayload,where_data,(err, res) => {
        if (err) {
          return 0;
        } else {
          return res;
        }
      }
    );
  }
};
exports.generate_htmlLink = async (table_name, field_name, field_id, field_link, cat_name, action, cat_id = "") => {
  try {
    const arr_spchar = ["`","~","!","%","^","*","(",")","{","}","[","]","&","$","#","@",":","_","/","\\","+",",",".","?","'",'"',"£"];
    const regexPattern = arr_spchar.map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(regexPattern, "g");
    let str = cat_name.replace(regex, "");
    let new_string = str.toLowerCase().replace(/ /g, "-");
    let final_string = new_string.replace(/--/g, "-");

    if (action === "add") {
      const sql = `SELECT ${field_link} FROM ${table_name} WHERE ${field_link} LIKE '${final_string}%'`;

      const getData = await sqlhelper.select(sql, [], (err, res) => {
        if (err) {
          return 0;
        } else {
          return res;
        }
      });

      for (let i = 0; i <= getData.length; i++) {
        const db_catlink = getData[i] ? getData[i][field_link] : null;

        if (db_catlink === final_string) {
          final_string = `${db_catlink}-${i}`;
        }
      }
    }

    if (action === "edit") {
      const sql1 = `SELECT ${field_name},${field_link} FROM ${table_name} WHERE ${field_id} = '${cat_id}'`;

      const row = await sqlhelper.select(sql1, [], (err, res) => {
        if (err) {
          // callback(err, new Array());
          return 0;
        } else {
          return res[0];
        }
      });
      if (row) {
        const db_field_link = row[field_link];
        if (db_field_link !== cat_name) {
          const sql = `SELECT ${field_name} FROM ${table_name} WHERE ${field_link} LIKE '${final_string}%' AND ${field_id} <> '${cat_id}'`;
          const vals = await sqlhelper.select(sql, [], (err, res) => {
            if (err) {
              // callback(err, new Array());
              return 0;
            } else {
              return res;
            }
          });
          for (let i = 0; i <= vals.length; i++) {
            const db_catlink = vals[i] ? vals[i][field_link] : null;
            if (db_catlink === final_string) {
              final_string = `${db_catlink}-${i}`;
            }
          }
        } else {
          final_string = db_field_link;
        }
      }
    }
    return final_string;
  } catch (e) {
    console.log("Something has gone wrong!", e);
    return false;
  }
};

exports.category_Breadcrumb = async (category_id) => {
  try {
    let catBreadcrumbQuery = `WITH RECURSIVE CategoryPath AS (
            SELECT category_id, parent_id, category_name
            FROM category
            WHERE category_id = ?
            UNION
            SELECT c.category_id, c.parent_id, c.category_name
            FROM category c
            JOIN CategoryPath cp ON c.category_id = cp.parent_id
        )
        SELECT CONCAT('[{"parent_id":0,"name":"Category Root"},', GROUP_CONCAT(CONCAT('{"parent_id":', cp.category_id, ',"name":"', cp.category_name, '"}') ORDER BY cp.category_id ASC SEPARATOR ','), ']') AS breadcrumb
        FROM CategoryPath cp`;
    var catBreadcrumb = await sqlhelper.select(catBreadcrumbQuery, [category_id], (err, res) => {
        if (err) {
          console.log(err);
          return 0;
        } else {
          return JSON.parse(res[0].breadcrumb);
        }
      }
    );
    if (!_.isEmpty(catBreadcrumb)) {
      catBreadcrumb.forEach((category, index) => {
        category.is_clickable = index !== catBreadcrumb.length - 1;
      });
    } else {
      catBreadcrumb = [];
    }

    return catBreadcrumb;
  } catch (e) {
    console.log("Something has gone wrong!", e);
    return false;
  }
};
exports.module_Breadcrumb = async (module_id) => {
  try {
    let moduleBreadcrumbQuery = `WITH RECURSIVE ModulePath AS (
            SELECT module_id, parent_id, name
            FROM module
            WHERE module_id = ?
            UNION
            SELECT m.module_id, m.parent_id, m.name
            FROM module m
            JOIN ModulePath mp ON m.module_id = mp.parent_id
        )
        SELECT CONCAT('[{"parent_id":0,"name":"Module Root"},', GROUP_CONCAT(CONCAT('{"parent_id":', mp.module_id, ',"name":"', mp.name, '"}') ORDER BY mp.module_id ASC SEPARATOR ','), ']') AS breadcrumb
        FROM ModulePath mp`;

    var moduleBreadcrumb = await sqlhelper.select(moduleBreadcrumbQuery, [module_id], (err, res) => {
        if (err) {
          console.log(err);
          return 0;
        } else {
          return JSON.parse(res[0].breadcrumb);
        }
      }
    );

    if (!_.isEmpty(moduleBreadcrumb)) {
      moduleBreadcrumb.forEach((category, index) => {
        category.is_clickable = index !== moduleBreadcrumb.length - 1;
      });
    } else {
      moduleBreadcrumb = [];
    }
    return moduleBreadcrumb;
  } catch (e) {
    console.log("Something has gone wrong!", e);
    return false;
  }
};
exports.headerMenu_Breadcrumb = async (header_menu_id) => {
  try {
    let headerMenuBreadcrumbQuery = `WITH RECURSIVE HeaderMenuPath AS (
            SELECT header_menu_id, parent_id, title
            FROM header_menu
            WHERE header_menu_id = ?
            UNION
            SELECT hm.header_menu_id, hm.parent_id, hm.title
            FROM header_menu hm
            JOIN HeaderMenuPath hmp ON hm.header_menu_id = hmp.parent_id
        )
        SELECT CONCAT('[{"parent_id":0,"name":"Menu Root"},', GROUP_CONCAT(CONCAT('{"parent_id":', hmp.header_menu_id, ',"name":"', hmp.title, '"}') ORDER BY hmp.header_menu_id ASC SEPARATOR ','), ']') AS breadcrumb
        FROM HeaderMenuPath hmp`;
    var headerMenuBreadcrumb = await sqlhelper.select(headerMenuBreadcrumbQuery, [header_menu_id], (err, res) => {
        if (err) {
          console.log(err);
          return 0;
        } else {
          return JSON.parse(res[0].breadcrumb);
        }
      }
    );
    if (!_.isEmpty(headerMenuBreadcrumb)) {
      headerMenuBreadcrumb.forEach((category, index) => {
        category.is_clickable = index !== headerMenuBreadcrumb.length - 1;
      });
    } else {
      headerMenuBreadcrumb = [];
    }
    return headerMenuBreadcrumb;
  } catch (e) {
    console.log("Something has gone wrong!", e);
    return false;
  }
};
exports.array_column = async (arr, valueKey, indexKey) => {
  return arr.reduce((acc, obj) => {
    acc[obj[indexKey]] = obj[valueKey];
    return acc;
  }, {});
};
exports.getImageBase64 = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer", // Get the image data as an array buffer
    });

    // Convert the received image data to base64
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:${response.headers["content-type"]};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error; // Handle error appropriately in your code
  }
};
exports.menu_permission = async (admin_ledger_id) => {
  let getPermissionQuery = `SELECT m.module_id,m.parent_id,m.name,m.slug,m.icon,m.meta_title,m.sequence_no,map.can_view,map.can_add,map.can_edit,map.can_delete,m.is_sidemenu_show
                      FROM module as m
                      LEFT JOIN module_admin_permission map ON map.module_id = m.module_id 
                      INNER JOIN admin_ledger au ON au.role_id = map.role_id
                      WHERE m.user_type=1 AND au.admin_ledger_id=?  AND (map.can_view =1 OR map.can_edit =1 OR map.can_delete =1 OR map.can_add =1) AND m.is_active = 1  ORDER BY m.sequence_no ASC`;

var getPermissionData = await sqlhelper.select(getPermissionQuery, [admin_ledger_id], (err, res) => {
    if (err) {
      return 0;
    } else {
      return res;
    }
  });

  if (_.isEmpty(getPermissionData)) {
    return 0;
  }

  const menu_array = [];
  const permissionObj = {};
  const moduleMap = new Map();
  getPermissionData.forEach((row) => {
    if (row.can_view === 1 && row.is_sidemenu_show === 1) {
      moduleMap.set(row.module_id, {
        icon: row.icon,
        pathname: row.slug === "#" ? "" : `/${row.slug}`,
        title: row.name,
        meta_title: row.meta_title,
        subMenu: [],
      });
    }

    const permissions = [];
    permissions.push(row.can_view ? "can_view" : "");
    permissions.push(row.can_add ? "can_add" : "");
    permissions.push(row.can_edit ? "can_edit" : "");
    permissions.push(row.can_delete ? "can_delete" : "");

    permissionObj[row.slug === "#" ? "" : `${row.slug}`] = permissions.filter(
      (permission) => permission !== ""
    );
  });

  // Organize modules into the menu structure
  moduleMap.forEach((moduleData, moduleId) => {
    const parentId = getPermissionData.find(
      (row) => row.module_id === moduleId
    ).parent_id;
    if (parentId === 0) {
      menu_array.push(moduleData);
    } else {
      const parentModule = moduleMap.get(parentId);
      if (parentModule) {
        parentModule.subMenu.push(moduleData);
      }
    }
  });

  const modifiedMenuArray = menu_array.map((item) => {
    let newItem = { ...item }; // Create a shallow copy of the item

    if (Array.isArray(newItem.subMenu) && newItem.subMenu.length === 0) {
      delete newItem.subMenu;
    }
    if (Array.isArray(newItem.subMenu)) {
      newItem.subMenu = newItem.subMenu.map((subItem) => {
          let newSubItem = { ...subItem }; // Create a shallow copy of the subItem

          if (
            Array.isArray(newSubItem.subMenu) &&
            newSubItem.subMenu.length === 0
          ) {
            delete newSubItem.subMenu;
          }
          if (newSubItem.pathname === "") {
            delete newSubItem.pathname;
          }
          if (newSubItem.icon === "") {
            delete newSubItem.icon;
          }
          return Object.keys(newSubItem).length === 0 ? undefined : newSubItem;
        })
        .filter(Boolean); // Remove undefined values
    }
    if (newItem.pathname === "") {
      delete newItem.pathname;
    }

    if (newItem.icon === "") {
      delete newItem.icon;
    }
    return newItem;
  });

  response = {
    permission_list: permissionObj,
    menu_list: modifiedMenuArray,
  };
  return response;
};
exports.getStoreValidationDetails = async (store_id) => {
  const getValidationQuery = `SELECT s.store_id 
                              FROM stores as s
                              LEFT JOIN stores_time_status as sts ON sts.store_id = s.store_id
                              LEFT JOIN stores_subscriptions as ss ON ss.store_id = s.store_id
                              WHERE s.store_id = '${store_id}' AND sts.status=1 AND NOW() between ss.start_date AND ss.end_date AND ss.transaction_status=1`;

  const getValidationQueryData = await sqlhelper.select(getValidationQuery,[],(err, res) => {
      if (err) {
        return 0;
      } else {
        return res;
      }
    }
  );

  if (_.isEmpty(getValidationQueryData)) {
    return 0;
  } else {
    return 1;
  }
};
exports.getLMGSetting = async (setting_key) => {

  let settingQuery = `SELECT setting_id,setting_title,setting_key,setting_value
                    FROM lmg_settings
                    WHERE is_active=1 AND setting_key=?`;
  var settingData = await sqlhelper.select(settingQuery, [setting_key], (err, res) => {
      if (err) {
          return 0;
      } else {
          return res[0];
      }
  });
  return settingData;
}
exports.getParameterValue = async (parameter_type_ids) => {

  let getDataQuery = `SELECT pv.parameter_value_id,pv.parameter_type_id,pv.value,pv.code,pv.image,pv.sequence_no,LOWER(concat(pv.accepted_values,',',pv.code)) as accepted_values
                          FROM parameter_value as pv
                          INNER JOIN parameter_type as pt ON pv.parameter_type_id=pt.parameter_type_id
                          WHERE pv.parameter_type_id IN(?) AND pv.is_active=1 ORDER BY pv.sequence_no ASC`;
  var getData = await sqlhelper.select(getDataQuery, [parameter_type_ids], (err, res) => {
      if (err) {
          return []; // or handle the error as needed
      } else {
          return res;
      }
  });
  return getData;
}

exports.getAllCountry = async () => {
  let getCountryQuery = 'SELECT country_id,name FROM geo_country WHERE is_active=1';
    let getData = await sqlhelper.select(getCountryQuery, [], (err, res) => {
      if (err) {
        return 0;
      } else {
        return res;
      }
    });
  return getData;
}
exports.getAllState = async () => {
  let getStateQuery = 'SELECT state_id,name FROM geo_state WHERE is_active=1';
    let getData = await sqlhelper.select(getStateQuery, [], (err, res) => {
      if (err) {
        return 0;
      } else {
        return res;
      }
    });
  return getData;
}
exports.getAllCity = async () => {
  let getCityQuery = 'SELECT city_id,name,is_metro_city FROM geo_city WHERE is_active=1';
    let getData = await sqlhelper.select(getCityQuery, [], (err, res) => {
      if (err) {
        return 0;
      } else {
        return res;
      }
    });
  return getData;
}

exports.Is_ParameterValue_Valid = async (parameterValue,validationArray) => {
  const responseData = {};
    let isValid =true;
    const stoneError = [];

    for (const [kValidationArray, vValidationArray] of Object.entries(validationArray)) {
        if (kValidationArray === "Bank") {
            const bankData = parameterValue[24][vValidationArray.toLowerCase()];
            
            if (bankData !== undefined) {
                responseData['Bank'] = bankData;
            } else {
                responseData['Bank'] = "";
                isValid = false;
                stoneError.push("Invalid "+vValidationArray+" bank");
            }
        } else if (kValidationArray === "Color") {
            const colorData = parameterValue[1][vValidationArray.toLowerCase()];
            if (colorData !== undefined) {
                responseData['Color'] = colorData;
            } else {
                responseData['Color'] = "";
                isValid = false;
                stoneError.push("Invalid Color");
            }
        } 
    }

    responseData['isValid'] = isValid;
    if (stoneError.length === 0) {
        responseData['Invalid_Comment'] = '-';
    } else {
        responseData['Invalid_Comment'] = stoneError.join(' - ');
    }

    return responseData;
}
