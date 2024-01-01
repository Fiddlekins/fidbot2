export function getCleanTitle(title: string): string {
  return title
    .replaceAll(/\n/g, ' ')
    .replaceAll(/<br>/g, '')
    .trim();
}
