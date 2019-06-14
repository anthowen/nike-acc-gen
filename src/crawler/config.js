const puppeteer = require("puppeteer");

module.exports = {
  async browser(proxy) {
    let chromePath =
      "./node_modules/puppeteer/.local-chromium/win64-662092/chrome-win/chrome.exe";
    if (process.env.NODE_ENV === "production")
      chromePath = "./chrome-win/chrome.exe";

    let browser;

    if (proxy) {
      browser = await puppeteer.launch({
        // args: ["--proxy-server=" + proxy.url],
        // headless: false,
        // slowMo: 100,
        ignoreHTTPSErrors: true,
        headless: true,
        args: [
          "--fast-start",
          "--disable-extensions",
          "--no-sandbox",
          "--proxy-server=" + proxy.url
        ],
        executablePath: chromePath
      });
    } else {
      browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        // headless: true,
        // args: ["--fast-start", "--disable-extensions", "--no-sandbox"],
        ignoreHTTPSErrors: true,
        executablePath: chromePath
      });
    }

    return browser;
  }
};
