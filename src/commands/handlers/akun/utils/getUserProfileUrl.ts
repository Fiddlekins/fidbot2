import {HOSTNAME} from "../config";

export function getUserProfileUrl(username: string): string {
  return `${HOSTNAME}/user/${username}`;
}
