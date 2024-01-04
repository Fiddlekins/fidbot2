export function convertTitleToURLTitle(title: string): string {
  return title
    .replaceAll(/<.*?>/g, '')
    .replaceAll(/\s/g, '_')
    .replaceAll(/['"]/g, '')
    .replaceAll(/[\\/]/g, '-');
}
