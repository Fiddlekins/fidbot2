export function convertTitleToURLTitle(title: string): string {
  return title.replace(/\s/g, '_').replace('<br>', '').replace(/\?/g, '');
}
