var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const accountsRouter = require("./routes/accounts");
const transactionsRouter = require("./routes/transactions");
const transfersRouter = require("./routes/transfers");

const isAuth = require("./auth/isauth");

var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/login", authRouter);
app.use("/api/v1/accounts", isAuth, accountsRouter);
app.use("/api/v1/transactions", isAuth, transactionsRouter);
app.use("/api/v1/transfers", isAuth, transfersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ details: err.message });
});

module.exports = app;
