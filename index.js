import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const USER_DATA_DIR = path.join(process.env.HOME, ".bsrouter/cache/zy");
const URL =
  "https://chatgpt.com/g/g-p-6823eb7dc04081918edc784c3c2f2984-zhong-yi/c/6822beb9-2fd0-8010-910a-8b25fe2910be";
const MESSAGE_SELECTOR = ".input-selector";
const RESPONSE_SELECTOR = ".response-selector";
const MESSAGE = "Hello, how are you?";
const OUTPUT_FILE = "responses.txt";
const INTERVAL = 600000; // 1 分钟

(async () => {
  try {
    // 删除 SingletonLock 文件，防止冲突
    const lockFilePath = path.join(USER_DATA_DIR, "SingletonLock");
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
    }

    const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-extensions",
        "--disable-popup-blocking",
        "--disable-renderer-backgrounding",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-hang-monitor",
        "--disable-sync",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-blink-features",
        "--disable-backgrounding-occluded-windows",
        "--remote-debugging-port=9222",
        "--proxy-server=http://127.0.0.1:7890",
      ],
    });

    const page = await browser.newPage();
    await page.goto(URL);

    async function sendMessage() {
      try {
        await page.fill(MESSAGE_SELECTOR, MESSAGE);
        await page.keyboard.press("Enter");
        console.log("Message sent:", MESSAGE);

        await page.waitForSelector(RESPONSE_SELECTOR);
        const responseText = await page.textContent(RESPONSE_SELECTOR);

        fs.appendFileSync(
          OUTPUT_FILE,
          `${new Date().toISOString()} - ${responseText}\n`
        );
        console.log("Response saved:", responseText);
      } catch (err) {
        console.error("Error in sending message:", err);
      }
    }

    setInterval(sendMessage, INTERVAL);
    sendMessage();
  } catch (err) {
    console.error("Error in launching browser:", err);
  }
})();
