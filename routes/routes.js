const router = require("express").Router();
const logController = require("../controllers/log-controller");
const blockedController = require("../controllers/blocked-controller");
const authController = require("../controllers/auth-controller");

/* GET */
router.get("/get/urls", blockedController.getUrls);
router.get("/get/url", blockedController.getOneUrl);
router.get("/get/allLogs", logController.getAllLogs);
router.get("/get/oneLogURL", logController.getOneLogURL);
router.get("/search", blockedController.search);

/* POST */
router.post("/addUrl", blockedController.addUrl);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/log", logController.addLog);

/* PUT */
router.put("/updateUrl", blockedController.updateUrl);

/* DELETE */
router.delete("/deleteUrl", blockedController.deleteUrl);
