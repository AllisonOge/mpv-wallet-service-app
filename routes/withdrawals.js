const { withdrawalsController } = require("../controllers/withdrawals");
const { checkSchema } = require("express-validator");
const router = require("express").Router();

router.post(
  "/",
  checkSchema({ amount: { isInt: parseInt } }),
  withdrawalsController
);

module.exports = router;
