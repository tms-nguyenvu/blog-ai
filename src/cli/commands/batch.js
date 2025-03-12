const chalk = require("chalk").default;
const ora = require("ora").default;
const fs = require("fs");
const csv = require("csv-parser");
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
    .command("batch <csvFile>")
    .description("Batch process multiple URLs from a CSV file")
    .option("--save", "Save blogs in database", true)
    .option("--no-save", "Do not save blogs in database")
    .action(async (csvFile, options) => {
      const { save } = options;
      const spinner = ora("Processing batch URLs...").start();

      if (!fs.existsSync(csvFile)) {
        spinner.fail(chalk.red("CSV file not found."));
        return;
      }

      const urls = [];
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on("data", (row) => {
          if (row.URL && row.Category && row.Style) {
            urls.push(row);
          }
        })
        .on("end", async () => {
          for (const { URL, Category: category, Style: style } of urls) {
            spinner.text = `Processing URL: ${URL}`;

            // Validate category input
            const { error } = categoryValidate({ name: category });
            if (error) {
              console.log(
                chalk.red(`Invalid category: ${error.details[0].message}`)
              );
              continue;
            }

            // Check if category exists, otherwise create it
            let categoryData = await Category.findOne({
              where: { name: category },
            });

            if (!categoryData) {
              categoryData = await Category.create({
                name: category,
                slug: generateSlug(category),
              });
            } else {
              categoryData = categoryData.toJSON();
            }

            try {
              const originalContent = await crawler.crawl(URL);
              if (!originalContent) {
                console.log(chalk.red(`No content found for ${URL}`));
                continue;
              }

              spinner.text = `Rewriting content for ${URL}`;

              // Generate prompt for AI rewriter
              const prompt = generatePrompt(originalContent, category, style);

              // Generate rewritten content
              const rewrittenContent = await aiRewriter.generateResponse(
                prompt
              );

              if (save) {
                // Save content to database
                const cleanContent = rewrittenContent.replace(
                  /<\/?[^>]+(>|$)/g,
                  ""
                );
                const postTitleMatch = cleanContent.match(/^(.+)$/m);
                const postTitle = postTitleMatch
                  ? postTitleMatch[1].trim()
                  : "Default Title";
                const normalizedTitle =
                  removeDiacritics(postTitle).toLowerCase();

                await Post.create({
                  title: postTitle,
                  normalized_title: normalizedTitle,
                  content: rewrittenContent,
                  source_url: URL,
                  style: style,
                  crawl_status: "completed",
                  crawl_time: new Date(),
                  ai_process_time: new Date(),
                  category_id: categoryData.id,
                });
                console.log(chalk.green(`Content saved for ${URL}`));
              } else {
                console.log(rewrittenContent);
              }
            } catch (error) {
              logger.error(`Error processing ${URL}:`, error.message);
              console.log(
                chalk.red(`Error processing ${URL}: ${error.message}`)
              );
            }
          }
          spinner.succeed(chalk.green("Batch processing completed!"));
          process.exit(0);
        });
    });
};
