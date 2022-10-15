const database = require("../knex/database");

exports.makeTransaction = (action, amount, beneficiary, accountId) => {
  return database
    .insert({
      action,
      amount: parseFloat(amount),
      beneficiary: parseInt(beneficiary),
      account_id: parseInt(accountId),
    })
    .into("transactions");
};

exports.updateBalance = (newBalance, id) => {
  return database("accounts")
    .update({ balance: parseFloat(newBalance) })
    .where({ id: parseInt(id) })
    .then((_) => true)
};

exports.getAccount = (id) => {
  return database
    .select()
    .from("accounts")
    .where((wherBuilder) => {
      wherBuilder.where("id", parseInt(id)).orWhere("user_id", parseInt(id));
    })
    .then((account) => {
      // console.log(account[0]);
      return account[0];
    });
};

exports.handleError = (errMessage="Oops we failed to address this. It will be resolved", status=500) => {
  const error = new Error(errMessage);
  error.status = status;
  return error
}
