const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("./../knex/database");
const config = require("../configs");

const createAccessToken = (user) => {
  const to_encode = { id: user.id, exp: parseInt(config.accessTokenExpiresMins) };
  console.log(to_encode)
  return jwt.sign(to_encode, config.secretKey, { algorithm: config.algorithm });
};

exports.authController = (req, res, next) => {
  // validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // TODO: throw error for error handling
    res.status(422).send({
      details: `Expected format: { username: <String>, password: <String> }.`,
    });
  }
  // find user in database
  database
    .select("*")
    .from("users")
    .where({ email: req.body.username })
    .then(async (user) => {
      // verify user's credential
      const validPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );

      if (!validPassword)
        return res
          .status(401)
          .header({ "WWW-Authenticate": "Bearer" })
          .send({ details: "User's credentials could not be verified" });

      // create and assign a token
      const token = createAccessToken(user[0]);

      res
        .status(200)
        .header("auth-token", token)
        .send({ token: token, token_type: "Bearer" });
    })
    .catch(console.log);
};
