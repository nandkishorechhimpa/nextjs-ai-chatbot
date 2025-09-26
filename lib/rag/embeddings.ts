import { UIMessage } from "ai";

// offline and stored alongside the text.
const mockDocumentTable = [
    { text: "The capital of France is Paris. Paris is also a major European cultural center.", embedding: [0.1, 0.2, 0.3, 0.4] },
    { text: "France is famous for its wine, cheese, and the Eiffel Tower. The Louvre Museum is located in Paris.", embedding: [0.5, 0.6, 0.7, 0.8] },
    { text: "The climate of France varies from region to region. The south has a Mediterranean climate.", embedding: [0.9, 1.0, 1.1, 1.2] },
    { text: "Python is a high-level, general-purpose programming language. It is widely used in data science.", embedding: [1.3, 1.4, 1.5, 1.6] },
];


/**
 * 1. Generates an embedding for a given query by calling an internal API.
 * This function simulates a call to an external embedding service.
 * @param {string} query The user's input query.
 * @returns {Promise<number[]>} A promise that resolves to a vector embedding (an array of numbers).
 */
// embeddings.ts
/**
 * Simple text → numeric vector conversion (mock embedding generator).
 * In real life, you'd call OpenAI, Groq, or Hugging Face APIs.
 */
export const generateEmbedding = (query: string): number[] => {
  console.log(`Generating embedding for: "${query}"`);

  // Normalize query → lowercase words
  const tokens = query.toLowerCase().split(/\W+/).filter(Boolean);

  // Map each token to a number (hash) and reduce to fixed-length vector
  const vectorSize = 4; // keep small for mock
  const embedding = new Array(vectorSize).fill(0);

  tokens.forEach((word, i) => {
    const hash = Array.from(word).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    embedding[i % vectorSize] += hash % 100 / 100; // keep values small
  });

  return embedding;
};

