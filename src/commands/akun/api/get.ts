import {COOKIE, HOSTNAME} from "../config";

export async function get(path: string): Promise<string> {
  const response = await fetch(`${HOSTNAME}/${path}`, {
    method: 'GET',
    headers: {
      'Cookie': COOKIE
    }
  })
  return response.text();
}
