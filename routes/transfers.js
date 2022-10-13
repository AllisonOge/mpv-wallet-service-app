const express = require("express");
const { checkSchema } = require("express-validator");
const { transfersController } = require("../controllers/transfers");

const router = express.Router();

router.post(
  "/",
  checkSchema({
    amount: { isInt: { if: parseInt } },
    beneficiary: { isInt: { if: parseInt } },
  }),
  transfersController
);

module.exports = router;
