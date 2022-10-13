const database = require("../knex/database");

exports.transactionsController = (req, res, next) => {
  const currentUser = req.currentUser;

  console.log(currentUser)
  
  database
    .select("*")
    .from("accounts")
    .where({ user_id: currentUser.id })
    .then((account) => {
      console.log(account);
      return database
        .select()
        .from("transactions")
        .where({ account_id: account[0].id });
    })
    .then(transactions => {
        console.log(transactions)
        res.status(200).send(transactions || [])
    }).catch((error) => {
      console.log(error)
      // user account does not exits (user yet to open account)
      res
        .status(404)
        .send({ details: `User ${currentUser.id} does not have an account` });
    });
};
