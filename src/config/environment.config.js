"use strict";

const development = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    database: process.env.DEV_DB_NAME || "bloggen",
    username: process.env.DEV_DB_USER || "super_admin",
    password: process.env.DEV_DB_PASS || "",
    host: process.env.DEV_DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
};

const production = {
  app: {
    port: process.env.PRO_APP_PORT || 3000,
  },
  db: {
    database: process.env.PRO_DB_NAME || "database_production",
    username: process.env.PRO_DB_USER || "root",
    password: process.env.PRO_DB_PASS || null,
    host: process.env.PRO_DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
};

const config = { development, production };
const env = process.env.NODE_ENV || "development";

module.exports = config[env];
