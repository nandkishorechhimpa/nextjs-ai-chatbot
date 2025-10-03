import { auth } from "@/app/(auth)/auth";
import type { ArtifactKind } from "@/components/artifact";
import {
  getDocumentsById,
  saveContent,
  saveDocument,
} from "@/lib/db/queries";
import { Content } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { generateEmbeddingsForChunks } from "@/lib/rag/embeddings";
import { chunkText } from "@/lib/rag/chunker";
import { generateUUID } from "@/lib/utils";
import { generateId } from "ai";


export async function POST(request: Request) {
  try {    
  // let  content = ''
  // request.json().then(data => {
  //   console.log("Received data:", data);
  // content =  data.text
  // }).catch((e) => {
  //   console.error("Error parsing JSON:", e);
  // }
  // );
 
  // const session = await auth();

  // if (!session?.user) {
  //   return new ChatSDKError("not_found:document").toResponse();
  // }

  const {
    text
  }: { text: string; } =
    await request.json();
  console.log("Received text:", text);  
  let content = text;
//  let content = `......MOCK DATA......`



  if (content.length > 0) {
    const [doc] = content;
  }

  //Split content into chunks of 500-600 words range to embedding
  const chunks = chunkText(content, {overlap:50, chunkSize: 300});
  console.log(`Split content into ${chunks.length} chunks`);
  if(chunks.length === 0){
    throw new ChatSDKError("not_found:document");
  }

  const chunksWithEmbeddings = await generateEmbeddingsForChunks(chunks);

    // Save document metadata
  let documentData = {
    userId: "030cc0bd-a8bf-4c39-83c5-90a4bc825690",
    kind: "text" as ArtifactKind,
    title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
    content: content,
  };
  const documentRes = await saveDocument(documentData);
  const {id, createdAt  }= documentRes[0];

  for(let chunk of chunksWithEmbeddings){
    let contentData =  {
            docId: id,
            docCreatedAt: createdAt,  
            chunkIndex: chunk.index,
            text: chunk.text,
            embedding: chunk.embedding,
        }
        await saveContent(contentData)
  } 
    console.log("Saved document and content chunks with embeddings");
  
    
  

  return Response.json({ status: 200 });
} catch (error) {
  console.error("Error in /api/content:", error);
  if (error instanceof ChatSDKError) {
    return error.toResponse();
  }
  return new ChatSDKError("bad_request:chat").toResponse();
 
}

}
