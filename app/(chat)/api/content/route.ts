import { auth } from "@/app/(auth)/auth";
import type { ArtifactKind } from "@/components/artifact";
import {
  getDocumentsById,
  saveContent,
  saveDocument,
} from "@/lib/db/queries";
import { Content } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { generateEmbeddingsForChunks, splitTextIntoChunks } from "@/lib/rag/embeddings";
import { generateUUID } from "@/lib/utils";
import { generateId } from "ai";


export async function POST(request: Request) {
 
  // const session = await auth();

  // if (!session?.user) {
  //   return new ChatSDKError("not_found:document").toResponse();
  // }

//   const {
//     content
//   }: { content: string; } =
//     await request.json();
 let content = `TechNova Solutions provides IT consulting, cloud computing, and cybersecurity services. We specialize in cloud migration (AWS, Azure, GCP), managed IT services, and enterprise software solutions. Our cybersecurity offerings include network security, endpoint protection, and compliance with GDPR and ISO 27001. We develop custom applications using React, Node.js, Python, and PostgreSQL, delivering ERP, CRM, and web/mobile apps. Key projects include a cloud migration for a finance firm, a cybersecurity overhaul for a healthcare provider, and an internal logistics management platform. Our 24/7 support ensures minimal downtime, proactive monitoring, and fast issue resolution for clients across multiple industries.`



  if (content.length > 0) {
    const [doc] = content;
  }

  //Split content into chunks of 500-600 words range to embedding
  const chunks = splitTextIntoChunks(content, 600);

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
}
