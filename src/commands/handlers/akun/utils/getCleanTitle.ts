export function getCleanTitle(title: string): string {
  return title
    .replaceAll(/<.*?>/g, '')
    .replaceAll(/\n/g, ' ')
    .trim();
}
