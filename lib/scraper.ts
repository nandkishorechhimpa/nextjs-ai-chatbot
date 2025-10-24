import { chromium } from "playwright";

// const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

//split chunks fix words basisi e.g 500 words, 200 words
export async function scrapePageText(url: string): Promise<{ title: string; text: string }> {
    if (!/^https?:\/\//i.test(url)) {
        throw new Error("Invalid URL: must start with http:// or https://");
    }
    try {

        const browser = await chromium.launch({
            headless: true,

            //********* Remove below line for production deployment ****************
            // executablePath: executablePath // Only for Local testing with specific Chrome version

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
//split chunks based on paragraph
export async function scrapePageStructured(url: string): Promise<{
    title: string;
    sections: { heading: string; paragraphs: string[] }[];
}> {
    if (!/^https?:\/\//i.test(url)) {
        throw new Error("Invalid URL: must start with http:// or https://");
    }

    let browser;
    try {
        browser = await chromium.launch({
            headless: true,

            // ⚠️ Remove below line in production (used only for local testing)
            // executablePath: executablePath,
        });

        const context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        });
        const page = await context.newPage();

        await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });

        const title = (await page.title()) || url;

        const sections = await page.evaluate(() => {
            // 🧹 Remove irrelevant elements
            document.querySelectorAll("script, style, noscript, iframe, svg, nav, footer, header").forEach((el) => el.remove());

            // Helper: Clean and normalize text
            const clean = (txt: string) => txt.replace(/\s+/g, " ").trim();

            // Select headings and paragraphs in DOM order
            const elements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6, p"));

            const sections: { heading: string; paragraphs: string[] }[] = [];
            let currentHeading = "Introduction";
            let currentParagraphs: string[] = [];

            console.log("Total elements found for structuring:", elements);
            for (const el of elements) {
                const tag = el.tagName.toLowerCase();
                const text = clean(el.textContent || "");

                if (!text) continue;

                if (tag.startsWith("h")) {
                    // Save previous section before starting a new one
                    if (currentParagraphs.length > 0) {
                        sections.push({ heading: currentHeading, paragraphs: currentParagraphs });
                    }

                    currentHeading = text;
                    currentParagraphs = [];
                } else if (tag === "p") {
                    currentParagraphs.push(text);
                }
            }

            // Push the last collected section
            if (currentParagraphs.length > 0) {
                sections.push({ heading: currentHeading, paragraphs: currentParagraphs });
            }

            return sections;
        });

        console.log(`Extracted ${sections.length} sections from the page.`);
        await browser.close();
        return { title, sections };

    } catch (error: any) {
        console.error(`❌ Scraping failed for ${url}:`, error.message);
        throw new Error(`Failed to scrape ${url}: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}
