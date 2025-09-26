// offline and stored alongside the text.
const mockDocumentTable = [
    { text: "John snow is the manager of kingslanding from past 20 yrs", embedding: [0.1, 0.2, 0.3, 0.4] },
    { text: "John snow  lives in new york at down street", embedding: [0.5, 0.6, 0.7, 0.8] },
    { text: "John snow salary is $1000 per month .", embedding: [0.9, 1.0, 1.1, 1.2] },
    { text: "Python is a high-level, general-purpose programming language. It is widely used in data science.", embedding: [1.3, 1.4, 1.5, 1.6] },
];


// Cosine similarity helper
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}


/**
 * Searches for the most similar documents based on cosine similarity.
 * @param embedding Query embedding
 * @param topK Number of results to return
 */
export const searchSimilarData = (embedding: number[], topK = 2) => {
  console.log("Searching for similar data...");

  const ranked = mockDocumentTable
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(embedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score) // highest similarity first
    .slice(0, topK);

  return ranked;
};