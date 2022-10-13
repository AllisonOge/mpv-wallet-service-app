const { validationResult } = require("express-validator");
const database = require("../knex/database");

exports.accountsController = (req, res, next) => {
  // validate request body
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // TODO: error handling
    res.status(422).send({ details: "Expected format: { amount: <Integer> }" });
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
        return database
          .insert({
            action: "deposit",
            amount: req.body.amount,
            beneficiary: req.currentUser.id,
            account_id: account[0].id,
          })
          .into("transactions");
      })
      .then((_) => {
        res.status(200).send({ message: "Account successfully created" });
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
        res.status(200).send({ message: "Account successfully created" });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
