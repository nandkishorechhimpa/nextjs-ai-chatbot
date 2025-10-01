import { index } from "drizzle-orm/mysql-core";

type Chunk = {
  index: number;
  text: string;
};
type ChunkWithEmbedding = {
  index: number;
  text: string;
  embedding: number[];
}

export function splitTextIntoChunks(text: string, chunkSize = 200): Chunk[] {
  try{
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }
  console.log("Splitting text into chunks of size:",text);
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const chunkText = text.slice(start, start + chunkSize);
    chunks.push({ index, text: chunkText });
    start += chunkSize;
    index += 1;
  }

  return chunks;
  }catch(error){
    console.error("Error in splitTextIntoChunks:", error);  
    return [{index:0, text:""}];
}
}

export async function generateEmbeddingsForChunks(chunks: Chunk[]): Promise<ChunkWithEmbedding[]> {
  let tempChunks: ChunkWithEmbedding[] = chunks.map(chunk => ({...chunk, embedding: []}));
  for (const chunk of tempChunks) {
    const response = await fetch(`${process.env.EMBEDDING_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_KEY}`,
      },
      body: JSON.stringify({
        text: chunk.text
      }),
    });
    const responseData = await response.json();
    console.log("Embedding response for chunk", chunk.index, responseData);
    chunk.embedding = responseData.embedding;
    
  }
  return tempChunks;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${process.env.EMBEDDING_API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_KEY}`,
    },
    body: JSON.stringify({
      text
    }),
  });
  const responseData = await response.json();
    console.log("Embedding response for chunk",responseData);
    return responseData.embedding;
}
