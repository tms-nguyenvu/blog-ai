const { program } = require("commander");
const chalk = require("chalk").default;
const ora = require("ora").default;
const fs = require("fs");
const aiRewriter = require("../../services/ai.rewriter");
const crawler = require("../../services/crawler");

// Command: bloggen init
program
  .command("init")
  .description("Initialize system")
  .action(async () => {
    const spinner = ora("Initializing system...").start();

    try {
      // Create folders
      if (!fs.existsSync("data")) {
        fs.mkdirSync("data", { recursive: true });
      }
      if (!fs.existsSync("data/logs")) {
        fs.mkdirSync("data/logs", { recursive: true });
      }

      // Create log file
      const logFilePath = "data/logs/system.log";
      if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, "");
      }

      spinner.succeed(chalk.green("System initialized successfully!"));
    } catch (error) {
      spinner.fail(`Error initializing system: ${error.message}`);
    }
  });

// Command: bloggen crawl <url> --style "<phong cách>" --category "<danh mục>"
program

  .command("crawl <url>")
  .description("Crawl content from URL, category, and style.")
  .option("--style <style>", "Set style for content")
  .option("--category <category>", "Set category for content")
  .action(async (url, { style, category }) => {
    const spinner = ora("Crawling content...").start();

    spinner.text = `Crawling content from URL: ${url}`;
    try {
      // Crawl original content
      const originalContent = await crawler.crawl(url);
      if (!originalContent) {
        console.log(chalk.red("No content found on the page."));
        return;
      }

      // Rewrite content with Gemini AI
      spinner.start("Rewriting content with AI...");

      const prompt = `Rewrite the following content in the style of ${
        style || "neutral"
      } and related to category ${
        category || "general"
      }:\n\n${originalContent}`;

      const rewrittenContent = await aiRewriter.generateResponse(prompt);

      console.log(rewrittenContent);

      spinner.succeed(chalk.green("Content crawled successfully!"));
    } catch (error) {
      spinner.fail(chalk.red("Error crawling content:", error.message));
    }
  });
program.parse(process.argv);
