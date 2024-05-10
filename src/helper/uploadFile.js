const multer = require("multer");
const path = require("path");
const fs = require("fs");
 
const uploadFiles = (userFor) => {
  let destination = "";
  switch (userFor) {
    case "category":
      destination = "assets/uploads/category";
      break;
    case "parameterValue":
      destination = "assets/uploads/parameterValue";
      break;
    case "adminLedger":
      destination = "assets/uploads/adminLedger";
      break;
    case "banner":
      destination = "assets/uploads/banner";
      break;
    case "tutorial":
      destination = "assets/uploads/tutorial";
      break;
    case "brand":
      destination = "assets/uploads/brand";
      break;
    case 'newUpdate':
      destination = 'assets/uploads/newUpdate';
      break;
    case "product":
      destination = "assets/uploads/product";
      break;
    case "pushNotification":
      destination = "assets/uploads/pushNotification";
      break;
    case "uploadFiles":
        destination = "assets/uploads/uploadFiles";
        break;
    case "ledger":
      destination = "assets/uploads/ledger";
      break;
    default:
      destination = "assets/uploads";
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__basedir, destination));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const explodedArray = file.originalname.split(".");
      const fileName = explodedArray[0].trim().replace(/ /g, "_");
      const filePath = `${fileName}_${Date.now()}${ext}`;
      cb(null, filePath);
    },
  });
}; 
const unlinkFiles = (files, deleteType = "") => {
  var filePaths = files;
  if (deleteType == "error") {
    filePaths = Object.values(files).flat();
  }

  filePaths.forEach((value) => {
    // const filePath = path.join(value.destination, value.filename);
    const filePath = path.join(value.filename);
    // const filePath = path.join(value.path);
    fs.unlink(filePath, (err) => {});
  });
};

module.exports = { uploadFiles, unlinkFiles };
