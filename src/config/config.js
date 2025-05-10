require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DEV_DB_USER || "postgres",
    password: process.env.DEV_DB_PASS || "postgres",
    database: process.env.DEV_DB_NAME || "mydatabase",
    host: process.env.DEV_DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "mydatabase",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: process.env.PRO_DB_USER || "postgres",
    password: process.env.PRO_DB_PASS || "postgres",
    database: process.env.PRO_DB_NAME || "mydatabase",
    host: process.env.PRO_DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
};
