const averageWordsPerMinute = 183;

export function getReadTime(wordCount: number): string {
  const minutes = Math.round(wordCount / averageWordsPerMinute);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hours`;
  }
  const days = Math.round(hours / 24);
  if (days < 365) {
    return `${days} days`;
  }
  const years = Math.round(days / 365);
  return `${years} years`;
}
