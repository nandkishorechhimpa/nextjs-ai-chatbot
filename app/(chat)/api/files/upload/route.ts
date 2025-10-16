// export const runtime = 'nodejs';

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import { auth } from "@/app/(auth)/auth";
import { handleUpload, HandleUploadBody } from "@vercel/blob/client";
import { ChatSDKError } from "@/lib/errors";
import { generateEmbeddingsForChunks } from "@/lib/rag/embeddings";
import { ArtifactKind } from "@/components/artifact";
import { saveContent, saveDocument, saveResource } from "@/lib/db/queries";
import { chunkText } from "@/lib/rag/chunker";
import PDFParser from "pdf2json";
import path from "path";

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size should be less than 10MB",
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ["application/pdf"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  console.log("Upload route hit");

  const session = await auth();
  console.log("Session in upload route:", session);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  if (body === null) {
    new Response("Request body is empty", { status: 400 });
  }
  console.log("This is TOKEN:", process.env.BLOB_READ_WRITE_TOKEN)
  console.log("This is TOKEN-part:", process.env.CHATBOT_BLOB_READ_WRITE_TOKEN)
  console.log("Upload request body", body);
  try {
    const { blob, userId } = body;
    //Insert into database

    // Run any logic after the file upload completed
    const obj = {
      filepath: blob.pathname,
      url: blob.downloadUrl,
    }
    console.log('Update user', obj);
    var tempFilePath = '';
    let parsedText = "";
    let filesizeInbytes = 0;
    async function downloadAndExtractText(blobUrl: string) {
      try {
        console.log("Downloading and extracting text from:", blobUrl);

        // const res = await fetch(blob.downloadUrl);
        // if (!res.ok) {
        //   throw new Error(`Failed to fetch file: ${res.statusText}`);
        // }
        // const buffer = await res.arrayBuffer();
        ``
        // Create temp folder if it doesn't exist
        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }

        // Generate unique temp file path
        tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);

        // Download file
        const response = await fetch(blob.downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ✅ Write binary file
        fs.writeFileSync(tempFilePath, buffer);
        // ✅ Check size and magic header
        const stats = fs.statSync(tempFilePath);
        console.log("Saved PDF size:", stats.size, "bytes");
        filesizeInbytes = stats.size;


        // Process PDF with pdf2json
        const pdfParser = new PDFParser();
        pdfParser.loadPDF(tempFilePath);

        const data: any = await new Promise((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", (err) => reject(err));
          pdfParser.on("pdfParser_dataReady", (pdfData) => resolve(pdfData));
        });




        if (data?.Pages?.length) {
          data.Pages.forEach((page: any) => {
            const pageText: string[] = [];

            page.Texts.forEach((text: any) => {
              text.R.forEach((r: any) => {
                // Decode URI-encoded text and remove weird symbols
                const decoded = decodeURIComponent(r.T)
                  .replace(/\s+/g, " ") // normalize multiple spaces
                  .replace(/[^\x20-\x7E]/g, ""); // strip non-printable chars

                pageText.push(decoded);
              });
            });

            parsedText += pageText.join("") + "\n\n"; // separate pages
          });
        }

        parsedText.trim();

        const text = parsedText;

        console.log("text examples:", text.slice(0, 100));


        // const parser = new PDFParse({ data: Buffer.from(buffer) });
        // console.log("Buffer length:", buffer.byteLength);

        // const textResult = await parser.getText();


        // const text = textResult.text;

        console.log("Extracted text length:", text.length);

        // Perform chunking
        const chunks = chunkText(text); // your custom chunking logic

        // Save to DB or trigger AI embedding
        // await db.insert('chunks', chunks);

        return { chunks, text };
        // return { chunks: [], text: '' };

      } catch (error) {

        console.error("Error in downloadAndExtractText:", error);
        return { chunks: [], text: "" };

      }
    }

    //Fetch the  file using url and extract text from pdf
    const { chunks, text } = await downloadAndExtractText(blob.downloadUrl);
    console.log("After getting chunks", chunks.length);

    if (chunks.length === 0) {
      throw new ChatSDKError("not_found:document");
    }

    const chunksWithEmbeddings = await generateEmbeddingsForChunks(chunks);


    //extract file path frm blob downloadUrl
    obj.filepath = blob.blobUrl.split("?")[0];


    // Save document metadata
    let documentData = {
      userId: userId,
      kind: "text" as ArtifactKind,
      title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
      content: text,
    };
    const documentRes = await saveDocument(documentData);
    const { id, createdAt } = documentRes[0];

    for (let chunk of chunksWithEmbeddings) {
      let contentData = {
        docId: id,
        docCreatedAt: createdAt,
        chunkIndex: chunk.index,
        text: chunk.text,
        embedding: chunk.embedding,
      }
      await saveContent(contentData)
    }
    console.log("Saved document and content chunks with embeddings");

    //Save the file data into files table
    saveResource({ userId, filepath: blob.pathname, url: blob.downloadUrl, filesize: blob.size ? blob.size : filesizeInbytes })

    fs.unlinkSync(tempFilePath);
    return NextResponse.json({ message: "File uploaded successfully" });

  } catch (_error) {
    console.error("Error in file upload handler:", _error);
    return NextResponse.json(
      { error: "Failed to process request", details: _error instanceof Error ? _error.message : String(_error) },
      { status: 400 }
    );
  }
}



// export async function POST(request: Request) {
//   const session = await auth();

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   if (request.body === null) {
//     return new Response("Request body is empty", { status: 400 });
//   }

//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as Blob;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const validatedFile = FileSchema.safeParse({ file });

//     if (!validatedFile.success) {
//       const errorMessage = validatedFile.error.errors
//         .map((error) => error.message)
//         .join(", ");

//       return NextResponse.json({ error: errorMessage }, { status: 400 });
//     }

//     // Get filename from formData since Blob doesn't have name property
//     const filename = (formData.get("file") as File).name;
//     const fileBuffer = await file.arrayBuffer();

//     try {
//       const data = await put(`${filename}`, fileBuffer, {
//         access: "public",
//       });

//       return NextResponse.json(data);
//     } catch (_error) {
//       return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//     }
//   } catch (_error) {
//     return NextResponse.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     );
//   }
// }
