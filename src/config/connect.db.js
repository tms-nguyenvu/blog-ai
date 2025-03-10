const { Sequelize } = require("sequelize");
const { logger } = require("../utils/logger");
const config = require("./environment.config");

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");
    return true;
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    return false;
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info(`Database synchronized ${force ? "(tables recreated)" : ""}`);
    return true;
  } catch (error) {
    logger.error("Error synchronizing database:", error);
    return false;
  }
};

module.exports = {
  sequelize,
  initDatabase,
  syncDatabase,
};
