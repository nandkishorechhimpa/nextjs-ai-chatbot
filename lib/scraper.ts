import { chromium } from "playwright";

/**
 * @param url The target webpage URL
 * @returns {Promise<{ title: string, text: string }>}
 */
export async function scrapePageText(url: string): Promise<{ title: string; text: string }> {
    if (!/^https?:\/\//i.test(url)) {
        throw new Error("Invalid URL: must start with http:// or https://");
    }
    try {

        const browser = await chromium.launch({
            headless: true,

            //********* Remove below line for production deployment ****************
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" // Only for Local testing with specific Chrome version

        });
        const context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        });
        const page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });

            const title = (await page.title()) || url;

            // Extract text while preserving natural spacing
            let text = await page.evaluate(() => {
                // Remove script and style elements
                document.querySelectorAll("script, style, noscript").forEach((el) => el.remove());

                // Extract visible text from the body
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
                let content = "";
                while (walker.nextNode()) {
                    const nodeText = walker.currentNode?.textContent ?? "";
                    if (nodeText.trim()) {
                        content += nodeText + " ";
                    }
                }
                console.log(`Extracted ${content.length} characters of text`);
                console.log(`Sample text: ${content.slice(300, 500)}`);
                return content.replace(/\s+/g, " ").trim();
            });

            return { title, text };
        } catch (error: any) {
            console.error(`❌ Scraping failed for ${url}:`, error.message);
            throw new Error(`Failed to scrape ${url}: ${error.message}`);
        } finally {
            await browser.close();
        }


    } catch (error: any) {
        console.error(`❌ Scraping failed for ${url}:`, error.message);
        throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
}
