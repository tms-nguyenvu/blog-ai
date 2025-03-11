"use strict";

const chalk = require("chalk").default;
const ora = require("ora").default;
const { Post } = require("../../models");

module.exports = (program) => {
  program
    .command("list")
    .description("List all available posts")
    .action(async () => {
      const spinner = ora("Fetching posts...").start();

      try {
        const posts = await Post.findAll();
        spinner.succeed(chalk.green("Posts fetched successfully!"));

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
      } catch (error) {
        spinner.fail(chalk.red("Failed to fetch posts."));
        console.error(chalk.red(error.message));
      }
    });
};
