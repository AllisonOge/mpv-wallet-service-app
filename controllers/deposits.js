const { validationResult } = require("express-validator");
const {
  handleError,
  getAccount,
  makeTransaction,
  updateBalance,
} = require("../utils/utils");

exports.depositsController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMessage = [];
    for (let err of errors.array()) errMessage.push(err.msg);
    return next(handleError(errMessage));
  }

  const amount = parseFloat(req.body.amount);

  if (amount <= 0)
    return next(
      handleError("Amount is invalid: enter a value greater than 0", 403)
    );

  // get account
  const userAcc = await getAccount(req.currentUser.id);

  if (!userAcc)
    return next(
      handleError(`User ${req.currentUser.id} does not have an account`, 404)
    );

  // make transaction
  const deposit = await makeTransaction(
    "deposit",
    amount,
    userAcc.id,
    userAcc.id
  );

  if (!deposit) return next(handleError());

  const newBal = userAcc.balance + amount;
  if (!(await updateBalance(newBal, userAcc.id))) return next(handleError());

  res.status(201).send({ message: "Deposit successful" });
};
