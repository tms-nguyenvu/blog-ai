"use strict";

const chalk = require("chalk").default;
const ora = require("ora").default;
const { initRedis } = require("../../config/redis");
const { Post } = require("../../models");

module.exports = (program) => {
  program
    .command("list")
    .description("List all available posts")
    .action(async () => {
      const redisClient = await initRedis();

      const cacheKey = "list-posts";

      const cachedData = await redisClient.get(cacheKey);

      const spinner = ora("Fetching posts...").start();

      try {
        let posts;
        if (cachedData) {
          posts = JSON.parse(cachedData);
          spinner.succeed(chalk.green("Posts fetched from cache."));
        } else {
          posts = await Post.findAll({
            attributes: ["title", "id"],
          });
          spinner.succeed(chalk.green("Posts fetched successfully!"));
          await redisClient.set(cacheKey, JSON.stringify(posts), {
            EX: 300,
          });
        }

        if (posts.length === 0) {
          console.log(chalk.yellow("No posts found."));
        } else {
          console.log(chalk.blue("Available posts:"));
          posts.forEach((post, index) => {
            console.log(
              chalk.green(`${index + 1}. ${post.title} (ID: ${post.id})`)
            );
          });
        }
        process.exit(0);
      } catch (error) {
        spinner.fail(chalk.red("Failed to fetch posts."));
        console.error(chalk.red(error.message));
      }
    });
};
