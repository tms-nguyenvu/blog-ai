const puppeteer = require("puppeteer");

class PuppeteerCrawler {
  constructor({ headless = true } = {}) {
    this.headless = headless;
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: this.headless });
    }
  }

  getBrowserInstance() {
    return this.browser;
  }

  async crawl(url) {
    await this.init();
    const page = await this.browser.newPage();

    await page.setCacheEnabled(false);

    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");
    await client.send("Network.clearBrowserCache");

    const randomParam = `nocache=${Date.now()}`;
    const urlWithRandom = url.includes("?")
      ? `${url}&${randomParam}`
      : `${url}?${randomParam}`;

    try {
      await page.goto(urlWithRandom, { waitUntil: "networkidle2", timeout: 0 });

      const content = await page.evaluate(() => {
        const article = document.querySelector("article");
        return article ? article.innerText : document.body.innerText;
      });

      return content;
    } catch (error) {
      console.error(`❌ Error crawling URL ${url}:`, error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PuppeteerCrawler();
