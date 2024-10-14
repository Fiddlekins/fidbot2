import {setTimeout} from 'node:timers/promises'
import {Cache} from "../../../Cache";
import {getStories} from "./api/getStories";

export const HOSTNAME = 'https://fiction.live';

export const COOKIE = [
  '__cfduid=d95fdab71be8cd3017fe3d6796bfed6931473093587;',
  'ajs_group_id=null;',
  'ajs_anonymous_id=%222cced225-0eea-4026-b2ad-d6ff046b4d51%22;',
  'loginToken=%7B%22loginToken%22%3A%22qTANYN89zyFKvyEQf%22%2C%22userId%22%3A%22C8x2fwWvtRvr4CyFm%22%7D;',
  'ajs_user_id=%22C8x2fwWvtRvr4CyFm%22',
].join(' ');

export const storyNameToIdCache = new Cache<string>({
  id: 'storyNameToIdCache',
  maxSize: 0,
  persist: true,
  saveInterval: 10000,
});

export async function prepopulateStoryCache() {
  let page = 1;
  let partialStoryNodes;
  do {
    partialStoryNodes = await getStories(page);
    console.log(`Warming akun story cache. Completed page ${page}, total retrieved stories ${storyNameToIdCache.size}`);
    // Limit rate a bit to avoid any mishap
    await setTimeout(1000);
    page++;
  }
  while (partialStoryNodes.length > 0);
}

export async function checkNewStories() {
  try {
    let page = 1;
    let continuePolling = true;
    while (continuePolling) {
      const priorSize = storyNameToIdCache.size;
      await getStories(page);
      continuePolling = storyNameToIdCache.size === priorSize;
      // Limit rate a bit to avoid any mishap
      await setTimeout(1000);
      page++;
    }
  } catch (err) {
    // Errors do not prevent the next check
    // Don't bother logging the errors, it's typically cloudflare timeout or something but in general this works sufficiently
    // console.error(err);
  }
  // Wait 10 mins before checking again
  await setTimeout(10 * 60 * 1000);
  checkNewStories().catch((err) => {
    // Don't bother logging the errors, it's typically cloudflare timeout or something but in general this works sufficiently
    // console.error(err);
  });
}
