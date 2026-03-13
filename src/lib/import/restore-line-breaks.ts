/**
 * Heuristically restore line breaks in text flattened by LinkedIn's CSV export.
 * Conservative: skips text that already contains newlines.
 */
export function restoreLineBreaks(text: string | null | undefined): string | undefined {
  if (text == null) return undefined;
  if (text === '' || text.includes('\n')) return text;

  let result = text;

  // Rule 1: Double-space after sentence end → paragraph break
  // Must come first so bullet rules don't interfere
  result = result.replace(/\.(\s{2,})/g, '.\n\n');

  // Rule 2: Bullet-style list items (- , * , • ) preceded by non-whitespace
  // Negative lookbehind avoids matching hyphens inside words (well-known)
  result = result.replace(/(?<=\S)\s+([-*\u2022])\s/g, '\n$1 ');

  // Rule 3: Numbered list items (1. , 2. , etc.) preceded by non-whitespace
  // Negative lookbehind for digit avoids matching decimals (2.5x)
  result = result.replace(/(?<!\d)\s+(\d{1,2}\.\s)/g, '\n$1');

  return result;
}
