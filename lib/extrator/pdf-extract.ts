
import { chunkText } from "../rag/chunker";




// export async function downloadAndExtractText(blobUrl: string) {
//   try {
//     console.log("Downloading and extracting text from:", blobUrl);

//     const response = await fetch(blobUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch file: ${response.statusText}`);
//     }
//     const buffer = await response.arrayBuffer();
//     const parser = await pdf(Buffer.from(buffer));

//     const textResult = parser.text;


//     const text = textResult;
//     console.log("Extracted text length:", text.length);

//     // Perform chunking
//     const chunks = chunkText(text); // your custom chunking logic

//     // Save to DB or trigger AI embedding
//     // await db.insert('chunks', chunks);

//     return { chunks, text };

//   } catch (error) {

//     console.error("Error in downloadAndExtractText:", error);
//     return { chunks: [], text: "" };

//   }
// }

