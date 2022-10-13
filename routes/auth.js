const express = require("express");
const { checkSchema } = require("express-validator");
const { authController } = require("../controllers/auth");

const router = express.Router();

router.post(
  "/",
  checkSchema({
    username: {
      isEmail: true,
      notEmpty: true,
      errorMessage: "Email must be valid",
    },
    password: {
      isString: true,
      errorMessage:
        "Password must be a string",
    },
  }),
  authController
);

module.exports = router;
