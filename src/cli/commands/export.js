const fs = require("fs");
const path = require("path");
const chalk = require("chalk").default;
const ora = require("ora").default;
const { Post } = require("../../models");

module.exports = (program) => {
  program
    .command("export")
    .description("Export posts to a file")
    .option("--format <format>", "File format: json, md, html")
    .option("--output <path>", "Output file path")
    .action(async (options) => {
      const { format, output } = options;

      if (!["json", "md", "html"].includes(format)) {
        console.log(
          chalk.red("Invalid format! Supported formats are json, md, html.")
        );
        return;
      }

      if (!output) {
        console.log(chalk.red("Please provide an output file path."));
        return;
      }

      const spinner = ora("Fetching posts...").start();

      try {
        const posts = await Post.findAll();
        spinner.succeed(chalk.green("Posts fetched successfully!"));

        if (posts.length === 0) {
          console.log(chalk.yellow("No posts available for export."));
          return;
        }

        let content = "";
        switch (format) {
          case "json":
            content = JSON.stringify(posts, null, 2);
            break;
          case "md":
            content = posts
              .map((p) => `# ${p.title}\n\n${p.content}`)
              .join("\n\n---\n\n");
            break;
          case "html":
            content = posts
              .map((p) => `<h1>${p.title}</h1><p>${p.content}</p>`)
              .join("<hr>");
            break;
        }

        let filePath;
        if (fs.existsSync(output) && fs.statSync(output).isDirectory()) {
          filePath = path.join(output, `posts.${format}`);
        } else {
          filePath = output;
        }

        const outputDir = path.dirname(filePath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
          console.log(chalk.yellow(`Created directory: ${outputDir}`));
        }

        fs.writeFileSync(filePath, content, "utf8");
        console.log(chalk.green(`Posts exported successfully: ${filePath}`));
      } catch (error) {
        spinner.fail(chalk.red("Error exporting file:"));
        console.log(chalk.red(error.message));
      }
    });
};
