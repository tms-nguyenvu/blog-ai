const chalk = require("chalk").default;
const ora = require("ora").default;
const aiRewriter = require("../../services/ai.rewriter");
const crawler = require("../../services/crawler");
const { logger } = require("../../utils/logger");

module.exports = (program) => {
  program
    .command("crawl <url>")
    .description("Crawl content from URL with specified style and category")
    .option("--style <style>", "Set style for the content", "neutral")
    .option("--category <category>", "Set category for the content", "general")
    .option("--save", "Save blog in database", true)
    .option("--no-save", "Do not save blog in database")
    .action(async (url, options) => {
      const { style, category } = options;
      const spinner = ora("Crawling content...").start();

      spinner.text = `Crawling content from URL: ${url}`;
      try {
        // Crawl original content using Puppeteer (in your crawler module)
        const originalContent = await crawler.crawl(url);
        if (!originalContent) {
          console.log(chalk.red("No content found on the page."));
          return;
        }

        spinner.text = "Rewriting content with AI...";
        const prompt = `Rewrite the following content in the style of ${style} and related to category ${category}:\n\n${originalContent}`;
        const rewrittenContent = await aiRewriter.generateResponse(prompt);

        // Save content in database
        console.log(rewrittenContent);

        spinner.succeed(chalk.green("Content crawled successfully!"));
      } catch (error) {
        logger.error("Error crawling content:", error.message);
        spinner.fail(chalk.red("Error crawling content:"), error.message);
      }
    });
};
