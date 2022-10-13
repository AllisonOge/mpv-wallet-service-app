var express = require("express");
const { checkSchema } = require("express-validator");
const { usersController } = require("../controllers/users");

var router = express.Router();

/* POST new user. */
router.post(
  "/",
  checkSchema({
    username: {
      isEmail: true,
      notEmpty: true,
      errorMessage: "Email should be valid",
    },
    password: {
      isStrongPassword: true,
      errorMessage:
        "Password must be at least 8 chars with at least 1 uppercase letter, 1 numeric and symbols",
    },
  }),
  usersController
);

module.exports = router;
