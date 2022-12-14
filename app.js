var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const accountsRouter = require("./routes/accounts");
const transactionsRouter = require("./routes/transactions");
const transfersRouter = require("./routes/transfers");
const withdrawalsRouter = require("./routes/withdrawals");
const depositsRouter = require("./routes/deposits");

const isAuth = require("./auth/isauth");

var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Contorl-Allow-Methods",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept"
  );
  return next()
});
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/login", authRouter);
app.use("/api/v1/accounts", isAuth, accountsRouter);
app.use("/api/v1/transactions", isAuth, transactionsRouter);
app.use("/api/v1/transfers", isAuth, transfersRouter);
app.use("/api/v1/withdrawals", isAuth, withdrawalsRouter);
app.use("/api/v1/deposits", isAuth, depositsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ details: err.message });
});

module.exports = app;
