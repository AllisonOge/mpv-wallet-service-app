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
    .catch((err) => {
      console.log(err);
      return false;
    });
};

exports.getAccount = (id) => {
  return database
    .select()
    .from("accounts")
    .where((wherBuilder) => {
      wherBuilder.where("id", parseInt(id)).orWhere("user_id", parseInt(id));
    })
    .then((account) => {
      console.log(account[0]);
      return account[0];
    });
};
