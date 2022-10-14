const { depositsController } = require("../controllers/deposits");
const { checkSchema } = require("express-validator");
const router = require("express").Router();

router.post(
  "/",
  checkSchema({ amount: { isInt: parseInt } }),
  depositsController
);

module.exports = router;
