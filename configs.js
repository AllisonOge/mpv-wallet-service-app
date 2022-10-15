const dotenv = require("dotenv")

dotenv.config()

module.exports = {
    host: process.env.DATABASE_HOSTNAME,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    secretKey: process.env.SECRET_KEY,
    algorithm: process.env.ALGORITHM,
    accessTokenExpiresMins: process.env.ACCESS_TOKEN_EXPIRES_MINS,
    environment: process.env.NODE_ENV
}