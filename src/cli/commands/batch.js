const chalk = require("chalk").default;
const ora = require("ora").default;
const fs = require("fs");
const csv = require("csv-parser");
const { Worker } = require("worker_threads");

module.exports = (program) => {
  program
    .command("batch <csvFile>")
    .description("Batch process multiple URLs from a CSV file")
    .option("--save", "Save blogs in database")
    .option("--no-save", "Do not save blogs in database")
    .action(async (csvFile, options) => {
      const { save } = options;
      const spinner = ora("Processing batch URLs...").start();

      if (!fs.existsSync(csvFile)) {
        spinner.fail(chalk.red("CSV file not found."));
        return;
      }

      const rows = [];
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on("data", (row) => {
          if (row.URL || row.Category || row.Style) {
            rows.push(row);
          }
        })
        .on("end", async () => {
          const workerPromises = rows.map((row) => {
            return new Promise((resolve, reject) => {
              const worker = new Worker("./src/workers/batch.js", {
                workerData: { row, save },
              });
              worker.on("message", resolve);
              worker.on("error", reject);
              worker.on("exit", (code) => {
                if (code != 0) {
                  reject(new Error(`Worker stopped with exit code ${code}`));
                }
              });
            });
          });

          try {
            const results = await Promise.all(workerPromises);

            results.forEach((result) => {
              if (result.error) {
                console.log(chalk.red(result.error));
              } else {
                console.log(chalk.green(result.message));
              }
            });
          } catch (error) {
            console.log(chalk.red("Error processing batch", error.message));
          }
          spinner.succeed(chalk.green("Batch processing completed!"));
          process.exit(0);
        });
    });
};
