const express = require("express");
const { transactionsController } = require("../controllers/transactions");

const router = express.Router();

router.get("/", transactionsController);

module.exports = router;
