import { writeFile, rename } from "fs/promises";
import { join, dirname } from "path";
import { ReviewItem } from "./types";

/**
 * Atomic JSONL write: writes to a temp file then renames.
 */
export async function writeReviewJsonl(
  filePath: string,
  items: ReviewItem[]
): Promise<void> {
  const dir = dirname(filePath);
  const tmpPath = join(dir, `.review.tmp.${Date.now()}.jsonl`);

  const lines = items.map((item) => JSON.stringify(item)).join("\n") + "\n";

  await writeFile(tmpPath, lines, "utf-8");
  await rename(tmpPath, filePath);
}
