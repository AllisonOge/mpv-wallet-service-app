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

  const amount = parseFloat(req.body.amount);
  const beneficiaryId = parseInt(req.body.beneficiary);

  if (amount <= 0)
    return next(
      handleError("Amount is invalid: enter a value greater than 0", 403)
    );

  // get user account
  const usersAcc = await getAccount(req.currentUser.id);

  if (!usersAcc)
    return next(
      handleError(`User ${req.currentUser.id} does not have an account`, 404)
    );

  // sufficient balance?
  const sufficientBal = usersAcc.balance >= amount ? true : false;

  // console.log(sufficientBal);
  if (!sufficientBal) return next(handleError("Insufficient balance", 409));

  // get beneficiary
  const beneficiary = await getAccount(beneficiaryId);

  // console.log(beneficiary);
  // does not exit
  if (!beneficiary)
    return next(handleError(`Account ${beneficiaryId} not found`, 404));

  if (usersAcc.id == beneficiary.id)
    return next(
      handleError("Restricted request: cannot transfer to self", 403)
    );

  //   perform a transaction
  // for the user
  const transactionUser = await makeTransaction(
    "transfer",
    amount,
    beneficiaryId,
    usersAcc.id
  );

  if (!transactionUser) return next(handleError());

  // update the balance
  const newBalanceUser = usersAcc.balance - amount;
  if (!(await updateBalance(newBalanceUser, usersAcc.id)))
    return next(handleError());

  // for the beneficiary
  const transactionBeneficiary = await makeTransaction(
    "transfer",
    amount,
    beneficiaryId,
    beneficiaryId
  );

  if (!transactionBeneficiary) return next(handleError());

  // update the balance
  const newBalanceBeneficiary = beneficiary.balance + amount;
  if (!(await updateBalance(newBalanceBeneficiary, beneficiary.id)))
    return next(handleError());

  res.status(201).send({ message: "Transfer successful" });
};
