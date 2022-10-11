const express = require("express");
const { validateUser } = require("./../schemas/schemas");
const database = require("./../knex/database");

const router = express.Router();

router.post("/", (req, res, next) => {
  const currentUser = { ...req.body };  
  console.log(validateUser(currentUser))
  console.log(currentUser);

  res.status(200).send({...currentUser})
});

module.exports = router
