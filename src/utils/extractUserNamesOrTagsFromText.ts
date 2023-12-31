export interface PossibleUserNameOrTag {
  removedText: string;
  username: string;
  discriminator?: string;
}

export interface ExtractedPossibleUserNameOrTags {
  text: string[];
  possibleUserNamesOrTags: PossibleUserNameOrTag[];
}

export function extractUserNamesOrTagsFromText(text: string) {
  const output: ExtractedPossibleUserNameOrTags = {
    text: [],
    possibleUserNamesOrTags: []
  };
  // Consider the following input that referenced three users: `@fiddlekins @Fidbot#9911 @Fidbot 2.0#4921`
  const [firstChunk, ...chunks] = text.split(/@/);
  output.text.push(firstChunk);
  for (const chunk of chunks) {
    const restoredChunk = `@${chunk}`;
    const legacyMatch = restoredChunk.match(/^@([^\n#]+)#(\d{4})/);
    if (legacyMatch) {
      const [fullLegacyReference, username, discriminator] = legacyMatch;
      output.text.push(restoredChunk.slice(fullLegacyReference.length));
      output.possibleUserNamesOrTags.push({removedText: fullLegacyReference, username, discriminator});
    } else {
      const contemporaryMatch = restoredChunk.match(/^@([a-z_.]+)/);
      if (contemporaryMatch) {
        const [fullContemporaryReference, username] = contemporaryMatch;
        output.text.push(restoredChunk.slice(fullContemporaryReference.length));
        output.possibleUserNamesOrTags.push({removedText: fullContemporaryReference, username});
      } else {
        output.text[output.text.length - 1] += restoredChunk;
      }
    }
  }
  return output;
}
