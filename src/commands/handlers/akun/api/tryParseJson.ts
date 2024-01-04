function tryParseHTML(response: string) {
  if (response.includes('<title>fiction.live | 524: A timeout occurred</title>')) {
    throw new Error(`CloudFlare: 524: A timeout occurred`);
  }
}

export function tryParseJson(response: string): unknown {
  if (response.startsWith('<!DOCTYPE html>')) {
    tryParseHTML(response);
  }
  try {
    return JSON.parse(response) as unknown;
  } catch (err) {
    console.error(`Non-JSON response:\n${response}`);
    throw new Error('getLive failed to parse response as JSON');
  }
}
