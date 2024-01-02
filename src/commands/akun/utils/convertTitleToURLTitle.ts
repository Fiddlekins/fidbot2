export function convertTitleToURLTitle(title: string): string {
  return title
    .replaceAll(/\s/g, '_')
    .replaceAll('<br>', '')
    .replaceAll(/[\\/]/g, '-');
}
