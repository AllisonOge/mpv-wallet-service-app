var express = require("express");
const database = require("../knex/database");

var router = express.Router();

/* POST new user. */
router.post("/", function (req, res, next) {
  console.log(req.body);
  const user = { ...req.body };
  // handle validation
  for (let requiredParam of ["username", "password"]) {
    if (!user.hasOwnProperty(requiredParam)) {
      // TODO: throw error for error handling
      res.status(422).send({
        error: `Expected format: { username: <String>, password: <String> }. You're missing a "${requiredParam}" property.`,
      });
    }
  }
  database("users")
    .select()
    .then((result) => {
      console.log(result);
    });

  res.status(200).send({ ...user });
});

module.exports = router;
