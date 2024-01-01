import {HOSTNAME} from "../config";
import {convertTitleToURLTitle} from "./convertTitleToURLTitle";

export function getStoryUrl(id: string, title?: string): string {
  return `${HOSTNAME}/stories/${convertTitleToURLTitle(title || 'unknown title')}/${id}`;
}
