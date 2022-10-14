const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const database = require("./../knex/database");
const { handleError } = require("../utils/utils");

exports.usersController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMessage = [];
    for (let err of errors.array()) {
      errMessage.push(err.msg)
    }
    return next(handleError(errMessage, 422));
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // TODO: insert user to database
  database
    .insert({
      email: req.body.username,
      password: hashedPassword,
    })
    .returning("id")
    .into("users")
    .then((id) => {
      id = id[0];
      res.status(200).send({ id, username: req.body.username });
    })
    .catch((error) => {
      // email already exist
      return next(
        handleError(`Duplicate entry: ${req.body.username} already exist`, 409)
      );
    });
};
