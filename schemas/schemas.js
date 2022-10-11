const validateUser = (user) => {
    for (let requiredParam of ["username", "password"]) {
        if (!user.hasOwnProperty(requiredParam)) {
          // TODO: throw error for error handling
          res.status(422).send({
            error: `Expected format: { username: <String>, password: <String> }. You're missing a "${requiredParam}" property.`,
          });
        }
      }

      return true
}


module.exports = {
    validateUser
}