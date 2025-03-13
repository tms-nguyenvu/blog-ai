const { parentPort, workerData } = require("worker_threads");
const { Category } = require("../models");
const { generateSlug } = require("../utils/util");
const { logger } = require("../utils/logger");
const crawler = require("../services/crawler");
const categoryValidate = require("../validators/category");
const generatePrompt = require("../utils/prompt");
const aiRewriter = require("../services/ai.rewriter");
const history = require("../utils/history");

const processRow = async (row, save) => {
  const { URL, Category: category, Style: style } = row;

  const { error } = categoryValidate({ name: category });

  if (error) {
    return {
      error: `Invalid category for ${URL}: ${error.details.message[0]}`,
    };
  }

  let categoryData = await Category.findOne({ where: { name: category } });
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
      return {
        error: `No content found for ${URL}`,
      };
    }

    const prompt = generatePrompt(originalContent, category, style);

    const rewrittenContent = await aiRewriter.generateResponse(prompt, history);

    if (save) {
      // Save content to database
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
        source_url: URL,
        style: style,
        crawl_time: new Date(),
        ai_process_time: new Date(),
        category_id: categoryData.id,
      });
      return {
        message: `Content saved for ${URL}`,
      };
    } else {
      return {
        message: rewrittenContent,
      };
    }
  } catch (error) {
    logger.error(`Error processing ${URL}`, error?.message);
    return { error: `Error processing ${URL}: ${error.message}` };
  }
};

processRow(workerData.row, workerData.save)
  .then((result) => parentPort.postMessage(result))
  .catch((error) => parentPort.postMessage({ error: error.message }));
