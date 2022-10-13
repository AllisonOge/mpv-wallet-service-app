const { validationResult } = require("express-validator");
const database = require("../knex/database");
const {
  getAccount,
  makeTransaction,
  updateBalance,
} = require("../utils/utils");

exports.transfersController = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty())
    return res.status(422).send({
      details:
        errors.array(),
    });

  console.log(req.currentUser)
  // get user account
  const usersAcc = await getAccount(req.currentUser.id).catch((err) => {
    console.log(err);
    // user does not have an account
    res.status(404).send({ details: "User does not have an account" });
  });

  // sufficient balance?
  const sufficientBal = usersAcc.balance >= req.body.amount ? true : false;

  console.log(sufficientBal);
  if (!sufficientBal)
    return res.status(409).send({ details: "Insufficient balance" });

  // get beneficiary
  const beneficiary = await getAccount(req.body.beneficiary);

  console.log(beneficiary);
  // does not exit
  if (!beneficiary)
    return res
      .status(404)
      .send({ details: `Account ${req.body.beneficiary} not found` });

  if (usersAcc.id == beneficiary.id)
    return res
      .status(409)
      .send({ details: "Restricted request: cannot transfer to self" });
  //   perform a transaction
  // for the user
  const transactionUser = await makeTransaction(
    "transfer",
    req.body.amount,
    req.body.beneficiary,
    usersAcc.id
  ).catch(console.log);

  console.log(transactionUser);

  // update the account
  const newBalanceUser = usersAcc.balance - req.body.amount;
  let _ = await updateBalance(newBalanceUser, usersAcc.id);

  // for the beneficiary
  const transactionBeneficiary = await makeTransaction(
    "transfer",
    req.body.beneficiary,
    req.body.beneficiary
  ).catch(console.log);

  console.log(transactionBeneficiary);

  // update the account
  const newBalanceBeneficiary = beneficiary.balance + req.body.amount;
  _ = await updateBalance(newBalanceBeneficiary, beneficiary.id);

  res.status(201).send({ message: "Transfer successful" });
};
