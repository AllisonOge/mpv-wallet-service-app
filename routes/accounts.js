const express = require("express");
const { checkSchema } = require("express-validator");
const { accountsController } = require("../controllers/accounts");

const router = express.Router();

router.post("/", checkSchema({ amount: { isFloat: parseFloat } }), accountsController);

module.exports = router;
