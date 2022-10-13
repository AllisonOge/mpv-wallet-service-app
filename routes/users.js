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
        "Password must be at least 8 characters long with a combination of at least an uppercase character, a lowercase character, a digit and a symbol",
    },
  }),
  usersController
);

module.exports = router;
