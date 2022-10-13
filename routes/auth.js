const express = require("express");
const { body } = require("express-validator");
const { authController } = require("../controllers/auth");

const router = express.Router();

router.post(
  "/",
  body("username").notEmpty().isEmail(),
  body("password").notEmpty().isStrongPassword(),
  authController
);

module.exports = router;
