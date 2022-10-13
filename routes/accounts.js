const express = require("express");
const { body } = require("express-validator");
const { accountsController } = require("../controllers/accounts");

const router = express.Router();

router.post("/", body("amount").notEmpty().isInt(), accountsController);

module.exports = router;
