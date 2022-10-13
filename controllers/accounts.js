const { validationResult } = require("express-validator");
const database = require("../knex/database");
const { makeTransaction, getAccount } = require("../utils/utils");

// open an account
exports.openAccountController = (req, res, next) => {
  // validate request body
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // TODO: error handling
    return res.status(422).send({ details: errors.array() });
  }

  // open an account with deposited amount
  if (req.body.amount > 0) {
    database
      .insert({ balance: req.body.amount, user_id: req.currentUser.id })
      .into("accounts")
      .then((_) => {
        return database
          .select()
          .from("accounts")
          .where({ user_id: req.currentUser.id });
      })
      .then((account) => {
        return makeTransaction(
          "deposit",
          req.body.amount,
          account[0].id,
          account[0].id
        );
      })
      .then((_) => {
        res.status(201).send({ message: "Account successfully created" });
      })
      .catch((err) => {
        console.log(err);
        // user already created an account
        res
          .status(409)
          .send({ details: "Duplicate entry: account already created" });
      });
  } else {
    database
      .insert({ user_id: req.currentUser.id })
      .into("accounts")
      .then((_) => {
        res.status(201).send({ message: "Account successfully created" });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(409)
          .send({ details: "Duplicate entry: account already created" });
      });
  }
};

// get an account
exports.getAccountController = async (req, res, next) => {
  const accountId = req.currentUser.id;

  const account = await getAccount(accountId).catch((err) => {
    console.log(err)
    // user has no account
    res.status(404).send({ details: "User does not have an account" });
  });
  
  res.status(200).send(account);
};
