const adminLedgerModule = require("../models/adminLedger.model");
const uploadHelper = require("../helper/uploadFile");
const encryptionhelper = require("../helper/encryption");
const sqlhelper = require("../helper/sqlhelper");

exports.login = (req, res) => {
  adminLedgerModule.login(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};
exports.logout = (req, res) => {
  adminLedgerModule.logout(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
}; 
exports.changePassword = (req, res) => {
  adminLedgerModule.changePassword(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
}; 
exports.onesignal = (req, res) => {
  adminLedgerModule.onesignal(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
}; 

exports.addAdminLedger = (req, res) => {
  adminLedgerModule.addAdminLedger(req, (err, data) => {
    if (err) {
      uploadHelper.unlinkFiles(req.files, "error");
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);

    } else {
      if (data.status == false) {
        uploadHelper.unlinkFiles(req.files, "error");
      }
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};
exports.updateAdminLedger = (req, res) => {
  adminLedgerModule.updateAdminLedger(req, (err, data) => {
    if (err) {
      uploadHelper.unlinkFiles(req.files, "error");
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      if (data.status == false) {
        uploadHelper.unlinkFiles(req.files, "error");
      }
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};
exports.deleteAdminLedger = (req, res) => {
  adminLedgerModule.deleteAdminLedger(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};
exports.updateStatus = (req, res) => {
  adminLedgerModule.updateStatus(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};
exports.listAdminLedger = (req, res) => {
  adminLedgerModule.listAdminLedger(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};
exports.getAdminDetails = (req, res) => {
  adminLedgerModule.getAdminDetails(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};

exports.exportAdminLedger = (req, res) => {
  adminLedgerModule.exportAdminLedger(req, (err, data) => {
    if (err) {
      const response = {
        response_temp: { status: false, message: err.message },
        response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
      };
      res.status(500).send(response);
    } else {
      let errorCode = data.errorCode;delete data.errorCode;
      const response = {
        response_temp: data,
        response: encryptionhelper.encrypt(JSON.stringify(data)),
      };
      res.status(errorCode).send(response);
    }
  });
};

// // User IP Address Add And Block.

// exports.addAdminIP = (req, res) => {
//   adminLedgerModule.addAdminIP(req, (err, data) => {
//     if(err)
//     {
//       const response = {
//         response_temp: {status: false, message: err.message},
//         response: encryptionhelper.encrypt(JSON.stringify({status: false, message: err.message}))
//       };
//       res.status(500).send(response);
//     }
//     else {
//       let errorCode = data.errorCode; delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data))
//       };
//       res.status(errorCode).send(response);
//     }
//   })
// }

// exports.updateAdminIP = (req, res) =>{
//   adminLedgerModule.updateAdminIP(req, (err, data) => {
//     if(err)
//     {
//       const response = {
//         response_temp: {status: false, message: err.message},
//         response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message}))
//       };
//       res.status(500).send(response);
//     }
//     else {
//       let errorCode = data.errorCode; delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data))
//       };
//       res.status(errorCode).send(response);
//     }
//   })
// }

// exports.blockAdminIP = (req, res) => {
//   adminLedgerModule.blockAdminIP(req, (err, data) => {
//     if(err)
//     {
//       const response = {
//         response_temp: {status: false, message: err.message},
//         response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message}))
//       }
//       res.status(500).send(response);
//     }
//     else {
//       let errorCode = data.errorCode; delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data))
//       };
//       res.status(errorCode).send(response);
//     }
//   })
// }

// exports.ListAdminIP = (req, res) => {
//   adminLedgerModule.ListAdminIP(req, (err, data) => {
//     if(err)
//     {
//       const response = {
//         response_temp: {status: false, message: err.message},
//         response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message}))
//       }
//       res.status(500).send(response);
//     }
//     else {
//       let errorCode = data.errorCode; delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data))
//       };
//       res.status(errorCode).send(response);
//     }
//   })
// }

// exports.deleteAdminLedgerIP = (req, res) => {
//   adminLedgerModule.deleteAdminLedgerIP(req, (err, data) => {
//     if (err) {
//       const response = {
//         response_temp: { status: false, message: err.message },
//         response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message })),
//       };
//       res.status(500).send(response);
//     } else {
//       let errorCode = data.errorCode;delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data)),
//       };
//       res.status(errorCode).send(response);
//     }
//   });
// };

// //  partial matching API 

// exports.CreateEncUser = (req, res) => {
//   adminLedgerModule.CreateEncUser(req, (err, data) => {
//     if(err)
//     {
//       const response = {
//         response_temp: {status: false, message: err.message},
//         response: JSON.stringify({status: false, message: err.message})
//       };
//       res.status(500).send(response);
//     }
//     else {
//       let errorCode = data.errorCode; delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data))
//       };
//       res.status(errorCode).send(response);
//     }
//   })
// }
 
// exports.searchPartialData = (req, res) => {

//   adminLedgerModule.searchPartialData(req, (err, data) => {
//     if(err)
//     {
//       const response = {
//         response_temp: {status: false, message: err.message},
//         response: encryptionhelper.encrypt(JSON.stringify({ status: false, message: err.message}))
//       }
//       res.status(500).send(response);
//     }
//     else {
//       let errorCode = data.errorCode; delete data.errorCode;
//       const response = {
//         response_temp: data,
//         response: encryptionhelper.encrypt(JSON.stringify(data))
//       };
//       res.status(errorCode).send(response);
//     }
//   })
// }

