// chunker.ts
/**
 * Utility to split large text into self-contained chunks with optional overlap.
 */

export interface ChunkOptions {
  /** Maximum number of words per chunk */
  chunkSize?: number;
  /** Number of overlapping words between consecutive chunks */
  overlap?: number;
}

export interface Chunk {
  /** The actual chunk text */
  text: string;
  /** Optional metadata like position in original document */
  index: number;
}

/**
 * Split a large text into chunks
 * @param text The text to split
 * @param options Optional configuration for chunk size and overlap
 * @returns Array of chunk objects
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const chunkSize = options.chunkSize ?? 200; // default 200 words
  const overlap = options.overlap ?? 50;      // default 50 words

  // Split text into words
  const words = text.split(/\s+/).filter(Boolean);

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < words.length) {
    const chunkWords = words.slice(start, start + chunkSize);
    const chunkText = chunkWords.join(" ");
    chunks.push({ text: chunkText, index });
    index++;
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Optional helper to chunk text by paragraphs first,
 * then by words if paragraphs are too large.
 */
export function chunkByParagraphs(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const chunkSize = options.chunkSize ?? 200;
  const overlap = options.overlap ?? 50;

  // Split by paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  const chunks: Chunk[] = [];
  let index = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length <= chunkSize) {
      chunks.push({ text: para.trim(), index });
      index++;
    } else {
      // Split large paragraph into smaller chunks
      let start = 0;
      while (start < words.length) {
        const chunkWords = words.slice(start, start + chunkSize);
        chunks.push({ text: chunkWords.join(" "), index });
        index++;
        start += chunkSize - overlap;
      }
    }
  }

  return chunks;
}
