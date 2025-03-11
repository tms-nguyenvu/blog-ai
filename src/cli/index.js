const { program } = require("commander");
const chalk = require("chalk");
const pkg = require("../../package.json");
require("dotenv").config();

// Import commands
const initCommand = require("./commands/init");
const crawlCommand = require("./commands/crawl");
const batchCommand = require("./commands/batch");
const listCommand = require("./commands/list");
const exportCommand = require("./commands/export");

// Set up the program
program
  .name("bloggen")
  .description("Automated blog content generation system from URLs using AI")
  .version(pkg.version);

// Register commands
initCommand(program);
crawlCommand(program);
batchCommand(program);
listCommand(program);
exportCommand(program);

// Handle unknown commands
program.on("command:*", () => {
  console.error(chalk.red(`\nInvalid command: ${program.args.join(" ")}`));
  console.log(`See ${chalk.cyan("--help")} for a list of available commands.`);
  process.exit(1);
});

// Parse arguments and display help if no args are provided
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);
