const { validationResult } = require("express-validator");
const database = require("../knex/database");
const { makeTransaction, getAccount, handleError } = require("../utils/utils");

// open an account
exports.openAccountController = (req, res, next) => {
  // validate request body
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errMessage = [];
    for (let err of errors.array()) errMessage.push(err.msg);
    return next(handleError(errMessage, 422));
  }

  const amount = parseFloat(req.body.amount);

  // open an account with deposited amount
  if (amount > 0) {
    database
      .insert({ balance: amount, user_id: req.currentUser.id })
      .into("accounts")
      .then((_) => {
        return database
          .select()
          .from("accounts")
          .where({ user_id: req.currentUser.id });
      })
      .then((account) => {
        return makeTransaction("deposit", amount, account[0].id, account[0].id);
      })
      .then((_) => {
        res.status(201).send({ message: "Account successfully created" });
      })
      .catch((err) => {
        // user already created an account
        return next(
          handleError("Duplicate entry: account already created", 409)
        );
      });
  } else {
    database
      .insert({ user_id: req.currentUser.id })
      .into("accounts")
      .then((_) => {
        res.status(201).send({ message: "Account successfully created" });
      })
      .catch((err) => {
        // user already created an account
        return next(
          handleError("Duplicate entry: account already created", 409)
        );
      });
  }
};

// get an account
exports.getAccountController = async (req, res, next) => {
  const accountId = req.currentUser.id;

  const account = await getAccount(accountId);

  if (!account) return next(handleError("User does not have an account", 404));

  res.status(200).send(account);
};
