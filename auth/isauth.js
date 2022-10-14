const jwt = require("jsonwebtoken");
const { secretKey, algorithm } = require("../configs");
const database = require("../knex/database");
const { handleError } = require("../utils/utils");

const verifyAccessToken = async (token, res) => {
  const payload = jwt.decode(token, secretKey, { algorithms: [algorithm] });
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

module.exports = async (req, res, next) => {
  let authorization = req.header("authorization");
  if (!authorization)
    return next(handleError("Access Denied / Unauthorized request", 401));

  const token = authorization.split(" ")[1];
  if (token === null || !token)
    return next(handleError("Invalid token", 422))

  const payload = await verifyAccessToken(token, res);

  database
    .select("*")
    .from("users")
    .where({ id: payload.id })
    .then((user) => {
      req.currentUser = { ...user[0] };
      next()
    }).catch(err => {
      return next(handleError())
    });
};
