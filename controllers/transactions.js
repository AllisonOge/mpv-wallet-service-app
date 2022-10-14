const database = require("../knex/database");
const { handleError } = require("../utils/utils");

exports.transactionsController = (req, res, next) => {
  const currentUser = req.currentUser;

  database
    .select("*")
    .from("accounts")
    .where({ user_id: currentUser.id })
    .then((account) => {
      return database
        .select()
        .from("transactions")
        .where({ account_id: account[0].id });
    })
    .then((transactions) => {
      // console.log(transactions)
      res.status(200).send(transactions || []);
    })
    .catch((err) => {
      // user account does not exits (user yet to open account)
      return next(
        handleError(`User ${currentUser.id} does not have an account`, 404)
      );
    });
};
