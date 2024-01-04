import {get} from "./get";
import {processChatNode} from "./processors/processChatNode";
import {tryParseJson} from "./tryParseJson";
import {ChatNode} from "./types/ChatNode";
import {ChatResponse} from "./types/responses";

export async function getStoryChatLatest(storyNodeId: string): Promise<ChatNode[]> {
  const response = await get(`api/chat/${storyNodeId}/latest`);
  const chatResponse = tryParseJson(response) as ChatResponse;
  try {
    const chatNodes = chatResponse.map(processChatNode);
    return chatNodes.filter((chatNode): chatNode is ChatNode => chatNode !== null);
  } catch (err) {
    console.error(err);
    throw new Error('getLive failed');
  }
}
