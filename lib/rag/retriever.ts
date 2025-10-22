import { eq, sql } from "drizzle-orm";
import { findContentByEmbedding } from "../db/queries";

export async function findSimilarContent(userQuery: string, topK = 5) {
  try {
    const rephrasedQuery = `${userQuery} about cyborg company`;
    console.log("Rephrased Query:", rephrasedQuery);
    // 1. Generate embedding for user query
    const response = await fetch(`${process.env.EMBEDDING_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_KEY}`,
      },
      body: JSON.stringify({
        text: rephrasedQuery
      }),
    });
    console.log("After user Query embedding")
    const responseData = await response.json();
    console.log("Embedding Response Data:", responseData);
    let queryEmbedding = responseData.embedding;
    console.log("Query Embedding:", queryEmbedding);
    // 2. Query Postgres using cosine similarity
    const similarRows = await findContentByEmbedding(queryEmbedding);
    console.log("Similar Rows:", similarRows);

    return similarRows; // array of content rows sorted by similarity

  } catch (error) {
    console.error("Error in findSimilarContent:", error);
    throw error;

  }
}
