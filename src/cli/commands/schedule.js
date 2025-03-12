"use strict";

const chalk = require("chalk").default;
const ora = require("ora").default;
const cron = require("node-cron");
const { execSync } = require("child_process");

module.exports = (program) => {
  program
    .command("schedule")
    .description("Schedule a new post crawl task")
    .option("--cron <expression>", "Cron expression for scheduling")
    .option("--csv <path>", "CSV file path for batch processing")
    .action((options) => {
      const { cron: cronExp, csv } = options;

      if (!cronExp || !csv) {
        console.log(chalk.red("❌ Missing --cron or --csv argument."));
        return;
      }

      console.log(chalk.green(`📅 Scheduling task with cron: ${cronExp}`));

      cron.schedule(cronExp, () => {
        const spinner = ora(`🚀 Running batch process for: ${csv}`).start();
        try {
          execSync(`npm run cli -- batch ${csv} --no-save`, {
            stdio: "inherit",
          });
          spinner.succeed(chalk.green("✅ Batch process completed!"));
        } catch (error) {
          spinner.fail(chalk.red("❌ Error running batch process:"));
          console.error(chalk.red(error.message));
        }

        console.log(chalk.blue("🛑 Task completed, exiting process."));
        process.exit(0);
      });

      console.log(chalk.yellow("⏳ Task scheduled. Running in background..."));
    });
};
