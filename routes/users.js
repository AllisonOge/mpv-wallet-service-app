var express = require("express");
const { body } = require("express-validator");
const { usersController } = require("../controllers/users");

var router = express.Router();

/* POST new user. */
router.post(
  "/",
  body("username").isEmail(),
  body("password").isStrongPassword(),
  usersController
);

module.exports = router;
