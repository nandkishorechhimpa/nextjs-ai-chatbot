import { NextRequest, NextResponse } from "next/server";
import cheerio from 'cheerio';
import { findDocumentFromUrl, saveContent, saveDocument } from "@/lib/db/queries";
import { string } from "zod/v4";
import { chunkText } from "@/lib/rag/chunker";
import { generateEmbeddingsForChunks } from "@/lib/rag/embeddings";
import { ArtifactKind } from "@/components/artifact";
import fs from 'fs';
import { scrapePageText } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { url, reindex = false, userId = null }: { url: [], reindex: boolean, userId: string | null } = await req.json();
    console.log("This is URL to be indexed:", url);
    // const cheerio = await import('cheerio');

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });

    }
    if (!url || url.length == 0) {
      return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
    }
    // if (!ensureAllowed(url)) {
    //   return NextResponse.json({ ok: false, error: "URL not allowed" }, { status: 403 });
    // }

    //process for all urls
    var res = [];
    for (const u of url) {
      let resObj = await processScrapeFromUrl(u, reindex, userId);
      res.push({ u: resObj });
    }
    return NextResponse.json({
      ok: true,
      skipped: false,
      // ...result,
      res,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
// function ensureAllowed(url: string) {
//   const allowed = (process.env.ALLOWED_ORIGIN || "").trim();
//   return allowed && url.startsWith(allowed);
// }

export async function scrapeUrlText(url: string): Promise<{ title: string; text: string }> {
  try {
    // 1) Fetch HTML
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }
    const html = await res.text();

    // 2) Load into Cheerio
    const $ = cheerio.load(html);

    // 3) Extract title
    const title = $("title").first().text().trim() || url;

    // 4) Extract body text (simple, preserve spacing)
    const bodyText = $("body")
      .text() // get all text content
      .replace(/\s+\n\s+/g, "\n") // normalize multi-line spacing
      .replace(/\s{2,}/g, " ")    // remove multiple spaces
      .trim();

    // 5) Combine title + body text
    const accumulatedText = title + "\n\n" + bodyText;
    console.log(`Scraped ${accumulatedText.length} characters from ${url}`);

    //create .txt file into temp folder
    fs.writeFileSync(`/tmp/scraped-${Date.now()}.txt`, accumulatedText);

    return { title, text: accumulatedText };
  } catch (err: any) {
    console.error("Error scraping URL:", url, err);
    return { title: url, text: "" };
  }
}

export async function processScrapeFromUrl(url: string, reindex: boolean, userId: string) {
  try {
    // 1) ScrapeText from html 
    const accumulatedText = await scrapePageText(url);

    if (accumulatedText.text.trim().length === 0) {
      return NextResponse.json({ ok: false, message: "No content to index" }, { status: 200 });
    }

    // return NextResponse.json({ ok: true, accumulatedText }, { status: 200 });
    // 2) Short-circuit if unchanged (string equality; simple but effective for POC)
    try {
      let source: 'file' | 'url' = "file"
      const existing = await findDocumentFromUrl(url, source);
      // if (!existing) {
      //   return NextResponse.json({ ok: true, existing: null });
      // }
      console.log("Found existing document:", existing);
      const existingText: string | null = existing[0]?.content || null;
      if (!reindex && existingText && existingText === accumulatedText.text) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          reason: "unchanged",
          documentId: existing[0]?.content || null,
          chunksCreated: 0,
          accumulatedText,
        });
      }
      console.log("Existing document:", existing);
      // return NextResponse.json({ ok: true, existing  });
    }
    catch (error: any) {
      console.error("Error checking existing document:", error);
      throw new Error(error);
    }

    // //Split into chunks
    // const chunks = chunkText(accumulatedText.text, { chunkSize: 500, overlap: 100 });
    // console.log(`Text split into ${chunks.length} chunks.`);

    // if (chunks.length === 0) {
    //   return NextResponse.json({ ok: false, error: "No content to index" }, { status: 400 });
    // }

    // //Generate embedding for chunks
    // const chunksWithEmbeddings = await generateEmbeddingsForChunks(chunks);
    // console.log("Processed chunks with embeddings:", chunksWithEmbeddings);

    // // Save document metadata
    // let documentData = {
    //   userId: userId,
    //   kind: "text" as ArtifactKind,
    //   title: accumulatedText.text.slice(0, 30) + (accumulatedText?.text?.length > 30 ? "..." : ""),
    //   content: accumulatedText.text,
    //   source: "url" as const,
    //   url: url,
    // };
    // const documentRes = await saveDocument(documentData);
    // const { id, createdAt } = documentRes[0];

    // for (let chunk of chunksWithEmbeddings) {
    //   let contentData = {
    //     docId: id,
    //     docCreatedAt: createdAt,
    //     chunkIndex: chunk.index,
    //     text: chunk.text,
    //     embedding: chunk.embedding,
    //   }
    //   await saveContent(contentData)
    // }
    console.log("Saved document and content chunks with embeddings");

    const title = accumulatedText.title || url;
    // console.log(`Document "${title}" processed and saved with ${chunksWithEmbeddings.length} chunks.`);
    return {
      accumulatedText
    }
  } catch (error: string | any) {
    console.log("Error while proces")
    throw new Error(error.message || String(error));
  }
}