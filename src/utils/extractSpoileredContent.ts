export function extractSpoileredContent(content: string): { displayed: string[], spoilered: string[] } {
  const output: { displayed: string[], spoilered: string[] } = {
    displayed: [],
    spoilered: [],
  };
  let inSpoiler = false;
  let chunkStartIndex = 0;
  let charIndex = 0;
  for (; charIndex < content.length;) {
    if (content[charIndex] === '|' && content[charIndex + 1] === '|') {
      if (inSpoiler) {
        inSpoiler = false;
        output.spoilered.push(content.slice(chunkStartIndex, charIndex));
        chunkStartIndex = charIndex + 2;
        charIndex += 2;
      } else {
        inSpoiler = true;
        output.displayed.push(content.slice(chunkStartIndex, charIndex));
        chunkStartIndex = charIndex + 2;
        // Skip the first character of the potential spoiler
        charIndex += 3;
      }
    } else {
      charIndex++;
    }
  }
  if (inSpoiler) {
    // Incomplete spoilers are displayed fully, and are part of the previous chunk
    output.displayed[output.displayed.length - 1] += content.slice(chunkStartIndex - 2, charIndex);
  } else {
    output.displayed.push(content.slice(chunkStartIndex, charIndex));
  }
  return output;
}
