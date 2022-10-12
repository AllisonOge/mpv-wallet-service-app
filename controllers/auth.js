const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("./../knex/database");
const config = require("../configs");

const createAccessToken = (user) => {
  const today = new Date();
  const expiration =
    today.getUTCMinutes() + parseInt(config.accessTokenExpiresMins);
  const to_encode = { id: user.id, exp: expiration };

  return jwt.sign(to_encode, config.secretKey);
};

const verifyAccessToken = async (token, res) => {
  const payload = jwt.decode(token, { complete: true });
  if (!payload) {
    return res
      .status(401)
      .header({ "WWW-Authenticate": "Bearer" })
      .send({ details: "User's credentials could not be verified" });
  }

  if (!payload.hasOwnProperty("id")) {
    return res
      .status(401)
      .header({ "WWW-Authenticate": "Bearer" })
      .send({ details: "User's credentials could not be verified" });
  }

  return { id: payload["id"] };
};

const getCurrentUser = async (token, res) => {
  const payload = await verifyAccessToken(token, res);
  return database.select("*").from("users").where({ id: payload.id });
};

const authController = (req, res, next) => {
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
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword)
        return res
          .status(401)
          .header({ "WWW-Authenticate": "Bearer" })
          .send({ details: "User's credentials could not be verified" });

      // create and assign a token
      const token = createAccessToken(user);

      res
        .status(200)
        .header("auth-token", token)
        .send({ token: token, token_type: "Bearer" });
    })
    .catch(console.log);
};

module.exports = {
  authController,
  getCurrentUser,
};
