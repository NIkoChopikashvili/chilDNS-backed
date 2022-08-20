const router = require("express").Router();
const logController = require("../controllers/log-controller");
const blockedController = require("../controllers/blocked-controller");
const authController = require("../controllers/auth-controller");
const isAuth = require("../middleware/isAuth");

/* GET */
router.get("/get/urls", isAuth, blockedController.getUrls);
router.get("/get/url", isAuth, blockedController.getOneUrl);
router.get("/get/allLogs", isAuth, logController.getAllLogs);
router.get("/get/oneLogURL", isAuth, logController.getOneLogURL);
router.get("/search", isAuth, blockedController.search);

/* POST */
router.post("/addUrl", blockedController.addUrl);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/log", isAuth, logController.addLog);
router.post("/blockURL", blockedController.blockURL);

/* PUT */
router.put("/updateUrl", isAuth, blockedController.updateUrl);

/* DELETE */
router.delete("/deleteUrl", isAuth, blockedController.deleteUrl);

module.exports = router;
