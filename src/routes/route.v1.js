const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const { decryptAPI } = require("../middleware/decription");
const multer = require("multer");
const uploadHelper = require("../helper/uploadFile");
const encryptionhelper = require("../helper/encryption");

const adminLedgerController = require("../controller/adminLedger.controller");


// start adminLedgerController
router.post("/login", decryptAPI, adminLedgerController.login);
router.post("/logout", verifyToken, decryptAPI, adminLedgerController.logout); // verify
router.put("/adminLedger/changePassword", verifyToken, decryptAPI, adminLedgerController.changePassword); // verify
router.put("/onesignal", verifyToken, decryptAPI, adminLedgerController.onesignal); // verify


router.post("/adminLedger", verifyToken,
  multer({ storage: uploadHelper.uploadFiles("adminLedger") }).fields([
    { name: "image", maxCount: 1 },
  ]),
  decryptAPI, adminLedgerController.addAdminLedger
); // verify
router.put("/adminLedger/:admin_ledger_id", verifyToken,
  multer({ storage: uploadHelper.uploadFiles("adminLedger") }).fields([
    { name: "image", maxCount: 1 },
  ]),
  decryptAPI, adminLedgerController.updateAdminLedger
); // verify
router.delete("/adminLedger/:admin_ledger_id", verifyToken, decryptAPI, adminLedgerController.deleteAdminLedger); // verify
router.put("/adminLedger/statusUpdate/:admin_ledger_id", verifyToken, decryptAPI, adminLedgerController.updateStatus); // verify

router.get("/adminLedger", verifyToken, decryptAPI, adminLedgerController.listAdminLedger); // verify
router.get("/adminLedger/get/:admin_ledger_id",verifyToken, decryptAPI,adminLedgerController.getAdminDetails); // verify
router.get("/adminLedger/export", verifyToken, decryptAPI, adminLedgerController.exportAdminLedger);
// End adminLedgerController


router.all("*", (req, res) => {
  return res.status(400).send({ status: false, message: "Invalid URL" });
});
module.exports = router;
