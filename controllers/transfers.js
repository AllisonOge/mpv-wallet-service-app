const { validationResult } = require("express-validator");
const database = require("../knex/database");
const {
  getAccount,
  makeTransaction,
  updateBalance,
  handleError,
} = require("../utils/utils");

exports.transfersController = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty())
    return res.status(422).send({
      details: errors.array(),
    });

  // get user account
  const usersAcc = await getAccount(req.currentUser.id);

  if (!usersAcc) return next(handleError("User does not have an account", 400));

  // sufficient balance?
  const sufficientBal = usersAcc.balance >= req.body.amount ? true : false;

  // console.log(sufficientBal);
  if (!sufficientBal) return next(handleError("Insufficient balance", 409));

  // get beneficiary
  const beneficiary = await getAccount(req.body.beneficiary);

  // console.log(beneficiary);
  // does not exit
  if (!beneficiary)
    return next(handleError(404, `Account ${req.body.beneficiary} not found`));

  if (usersAcc.id == beneficiary.id)
    return next(
      handleError("Restricted request: cannot transfer to self", 403)
    );

  //   perform a transaction
  // for the user
  const transactionUser = await makeTransaction(
    "transfer",
    req.body.amount,
    req.body.beneficiary,
    usersAcc.id
  );

  if (!transactionUser)
    return next(
      handleError()
    );

  // update the balance
  const newBalanceUser = usersAcc.balance - req.body.amount;
  await updateBalance(newBalanceUser, usersAcc.id);
     

  // for the beneficiary
  const transactionBeneficiary = await makeTransaction(
    "transfer",
    req.body.amount,
    req.body.beneficiary,
    req.body.beneficiary
  )

  if (!transactionBeneficiary)
    return next(
      handleError()
    );

  // update the balance
  const newBalanceBeneficiary = beneficiary.balance + req.body.amount;
  await updateBalance(newBalanceBeneficiary, beneficiary.id);

  res.status(201).send({ message: "Transfer successful" });
};
