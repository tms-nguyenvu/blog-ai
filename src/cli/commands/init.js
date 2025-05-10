const ora = require("ora").default;
const chalk = require("chalk").default;
const fs = require("fs");
const path = require("path");
const { initDatabase, syncDatabase } = require("../../config/connect.db");
const { logger } = require("../../utils/logger");

module.exports = (program) => {
  program
    .command("init")
    .description("Initialize system and connect to database")
    .option("--force", "Recreate all tables (drop existing data)", false)
    .action(async (options) => {
      const spinner = ora("Initializing system...").start();

      try {
        // Create necessary directories
        const dirs = [
          path.join(process.cwd(), "data"),
          path.join(process.cwd(), "data", "logs"),
          path.join(process.cwd(), "data", "exports"),
        ];

        for (const dir of dirs) {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info(`Created directory: ${dir}`);
          }
        }

        // Initialize database connection
        spinner.text = "Connecting to database...";
        const connected = await initDatabase();

        if (!connected) {
          spinner.fail(chalk.red("Unable to connect to database!"));
          return;
        }

        // Sync database models
        spinner.text = "Synchronizing database tables...";
        await syncDatabase(options.force);

        spinner.succeed(chalk.green("System initialized successfully!"));

        console.log("\nTo start using the system, try the following command:");
        console.log(
          `  ${chalk.cyan("npm run cli -- crawl")} ${chalk.yellow(
            "<url>"
          )} ${chalk.green('--style="professional" --category="technology"')}`
        );
        process.exit(0);
      } catch (error) {
        spinner.fail(chalk.red(`Error initializing system: ${error.message}`));
        logger.error("Init command failed:", error);
      }
    });
};
