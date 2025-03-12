const chalk = require("chalk").default;
const ora = require("ora").default;
const aiRewriter = require("../../services/ai.rewriter");
const categoryValidate = require("../../validators/category");
const crawler = require("../../services/crawler");
const removeDiacritics = require("remove-accents");
const generatePrompt = require("../../utils/prompt");
const { logger } = require("../../utils/logger");
const { Category, Post } = require("../../models");
const { generateSlug } = require("../../utils/util");

module.exports = (program) => {
  program
    .command("crawl <url>")
    .description("Crawl content from URL with specified style and category")
    .option("--style <style>", "Set style for the content", "neutral")
    .option("--category <category>", "Set category for the content", "general")
    .option("--save", "Save blog in database")
    .option("--no-save", "Do not save blog in database")
    .action(async (url, options) => {
      const { style, category, save } = options;

      // Validate category input
      const { error } = categoryValidate({ name: category });
      if (error) {
        console.log(chalk.red(`Invalid category: ${error.details[0].message}`));
        return;
      }

      const spinner = ora("Crawling content...").start();

      let categoryData = await Category.findOne({
        where: { name: category },
      });

      let finalSlug = generateSlug(category);

      if (!categoryData) {
        categoryData = await Category.create({
          name: category,
          slug: finalSlug,
        });
      } else {
        categoryData = categoryData.toJSON();
      }

      spinner.text = `Crawling content from URL: ${url}`;
      try {
        // Crawl original content using Puppeteer (in your crawler module)
        const originalContent = await crawler.crawl(url);
        if (!originalContent) {
          console.log(chalk.red("No content found on the page."));
          return;
        }

        spinner.text = "Rewriting content with AI...";

        // Generate prompt for AI rewriter
        const prompt = generatePrompt(originalContent, category, style);

        // Generate rewritten content using AI rewriter
        const rewrittenContent = await aiRewriter.generateResponse(prompt);

        if (save) {
          const cleanContent = rewrittenContent.replace(/<\/?[^>]+(>|$)/g, "");
          const postTitleMatch = cleanContent.match(/^(.+)$/m);
          const postTitle = postTitleMatch
            ? postTitleMatch[1].trim()
            : "Default Title";

          const normalizedTitle = removeDiacritics(postTitle).toLowerCase();

          await Post.create({
            title: postTitle,
            normalized_title: normalizedTitle,
            content: rewrittenContent,
            source_url: url,
            style: style,
            crawl_status: "completed",
            crawl_time: new Date(),
            ai_process_time: new Date(),
            category_id: categoryData.id,
          });
          console.log(chalk.green("Content saved to database."));
        } else {
          console.log(rewrittenContent);
        }
        spinner.succeed(chalk.green("Content crawled successfully!"));
        process.exit(0);
      } catch (error) {
        console.log(error);
        logger.error("Error crawling content:", error.message);
        spinner.fail(chalk.red("Error crawling content:"), error.message);
      }
    });
};
