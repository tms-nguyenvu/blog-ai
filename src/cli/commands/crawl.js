const chalk = require("chalk").default;
const ora = require("ora").default;
const aiRewriter = require("../../services/ai.rewriter");
const categoryValidate = require("../../validators/category");
const crawler = require("../../services/crawler");
const { logger } = require("../../utils/logger");
const { Category, Post } = require("../../models");
const { generateSlug } = require("../../utils/util");

module.exports = (program) => {
  program
    .command("crawl <url>")
    .description("Crawl content from URL with specified style and category")
    .option("--style <style>", "Set style for the content", "neutral")
    .option("--category <category>", "Set category for the content", "general")
    .option("--save", "Save blog in database", true)
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
        const prompt = `
Bạn là một AI chuyên viết bài chuyên nghiệp. Hãy viết lại nội dung bài viết dưới đây theo phong cách "${style}" và liên quan đến chủ đề "${category}".  

Hãy đảm bảo bài viết có **cấu trúc rõ ràng**, bao gồm các phần sau:  

1. **Tiêu đề**: Viết lại tiêu đề hấp dẫn, ngắn gọn  
2. **Giới thiệu**: Một đoạn giới thiệu tóm tắt nội dung chính  
3. **Nội dung chính**: Viết lại nội dung chi tiết theo cách mạch lạc  
4. **Kết luận**: Tổng kết bài viết, có thể gợi ý thêm nội dung liên quan  
5. **Tags**: Danh sách từ khóa liên quan  

Dưới đây là nội dung gốc cần viết lại:  

---  
${originalContent}  
---
  
Hãy trả về kết quả dưới dạng **một đoạn văn bản rõ ràng** theo đúng cấu trúc trên.
`;

        const rewrittenContent = await aiRewriter.generateResponse(prompt);

        if (save) {
          const cleanContent = rewrittenContent.replace(/<\/?[^>]+(>|$)/g, "");
          const postTitleMatch = cleanContent.match(/^(.+)$/m);
          const postTitle = postTitleMatch
            ? postTitleMatch[1].trim()
            : "Tiêu đề mặc định";

          await Post.create({
            title: postTitle,
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
      } catch (error) {
        logger.error("Error crawling content:", error.message);
        spinner.fail(chalk.red("Error crawling content:"), error.message);
      }
    });
};
