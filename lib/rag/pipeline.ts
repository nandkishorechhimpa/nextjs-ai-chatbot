import { UIMessage } from "ai";
import { generateEmbedding } from "./embeddings";
import { searchSimilarData } from "./retriever";

/**
 * 3. The main RAG pipeline function. It orchestrates the entire flow:
 * - Generates an embedding for the user's query.
 * - Retrieves relevant context from the mock database.
 * - Combines the query and context into a single, augmented prompt.
 * @param {string} userQuery The original user query.
 * @returns {Promise<string>} A promise that resolves to the final, augmented prompt string.
 */
export const  augmentQueryWithContext = async (userQuery:string): Promise<string> => {
    try {
        // Step 1: Generate an embedding for the query
        const queryEmbedding =  generateEmbedding(userQuery );

        // Step 2: Search for similar data using the embedding
        const relevantDocs =  searchSimilarData(queryEmbedding,3);

        // Step 3: Combine the original query with the retrieved context
        const context = relevantDocs.length > 0
            ? relevantDocs.map(doc => doc.text).join('\n---\n')
            : "No relevant context found.";

        const augmentedPrompt = `
          You are an expert assistant. Use the provided context ONLY to answer the user's question.
          If the context does not contain the answer, state that you do not have the information in the knowledge base.
          
          --- CONTEXT ---
          ${context}
          --- END CONTEXT --
        `;

        return augmentedPrompt;

    } catch (error) {
        console.error("Error in RAG pipeline:", error);
        return `I'm sorry, an error occurred while processing your request. Please try again later.`;
    }
}