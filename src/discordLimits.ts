const autocomplete = {
  choiceCount: 25,
  choiceNameLength: 100,
  choiceValueLength: 100,
}

const embed = {
  titleLength: 256,
  descriptionLength: 4096,
  fieldCount: 25,
  fieldNameLength: 256,
  fieldValueLength: 1024,
  footerLength: 2048,
  authorNameLength: 256,
  sumLength: 6000,
  embedsPerMessageCount: 10,
}

export const discordLimits = {
  autocomplete,
  embed,
}

export function clipText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength - 3)}...`;
  }
  return text;
}

export function clipArray<Type>(array: Type[], maxLength: number): Type[] {
  if (array.length > maxLength) {
    return array.slice(0, maxLength);
  }
  return array;
}
