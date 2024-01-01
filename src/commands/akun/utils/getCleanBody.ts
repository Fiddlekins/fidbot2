export function getCleanBody(body: string): string {
  return body
    .replaceAll(/\n/g, ' ')
    .replaceAll('<br>', '\n')
    .trim();
}
