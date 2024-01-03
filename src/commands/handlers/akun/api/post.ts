import querystring from "querystring";
import {COOKIE, HOSTNAME} from "../config";

export async function post(path: string, postData?: querystring.ParsedUrlQueryInput): Promise<string> {
  const postDataString = querystring.stringify(postData);
  const response = await fetch(`${HOSTNAME}/${path}`, {
    method: 'POST',
    headers: {
      'Cookie': COOKIE,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postDataString).toString()
    },
    body: postDataString
  });
  return response.text();
}
