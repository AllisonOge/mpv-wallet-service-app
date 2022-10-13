const express = require("express");
const { checkSchema } = require("express-validator");
const { openAccountController, getAccountController } = require("../controllers/accounts");

const router = express.Router();

router.post("/", checkSchema({ amount: { isFloat: parseFloat } }), openAccountController);

router.get("/", getAccountController)

module.exports = router;
