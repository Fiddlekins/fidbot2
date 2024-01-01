export function tryParseJson(response: string): unknown {
  try {
    return JSON.parse(response) as unknown;
  } catch (err) {
    console.error(`Non-JSON response:\n${response}`);
    throw new Error('getLive failed to parse response as JSON');
  }
}
