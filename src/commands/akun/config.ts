import {Cache} from "../../Cache";

export const HOSTNAME = 'https://fiction.live';

export const COOKIE = [
  '__cfduid=d95fdab71be8cd3017fe3d6796bfed6931473093587;',
  'ajs_group_id=null;',
  'ajs_anonymous_id=%222cced225-0eea-4026-b2ad-d6ff046b4d51%22;',
  'loginToken=%7B%22loginToken%22%3A%22qTANYN89zyFKvyEQf%22%2C%22userId%22%3A%22C8x2fwWvtRvr4CyFm%22%7D;',
  'ajs_user_id=%22C8x2fwWvtRvr4CyFm%22',
].join(' ');

export const storyNameToIdCache = new Cache<string, string>(100000);
