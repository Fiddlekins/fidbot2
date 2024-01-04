import {ChoiceNode} from "../types/ChoiceNode";
import {ChoiceNodeRaw} from "../types/ChoiceNodeRaw";
import {UUID} from "../types/ids";
import {processChatNode} from "./processChatNode";
import {processUsers} from "./processUsers";

export function processChoiceNode(choiceNodeRaw: ChoiceNodeRaw): ChoiceNode {
  const choiceReplyCount: ChoiceNode['choiceReplyCount'] = {};
  if (choiceNodeRaw.choiceReplies) {
    for (const choiceId of Object.keys(choiceNodeRaw.choiceReplies)) {
      choiceReplyCount[choiceId] = choiceNodeRaw.choiceReplies[choiceId]?.count || 0;
    }
  }
  const choices: ChoiceNode['choices'] = {};
  for (let choiceIndex = 0; choiceIndex < choiceNodeRaw.choices.length; choiceIndex++) {
    const choiceId = `${choiceIndex}`;
    choices[choiceId] = choiceNodeRaw.choices[choiceIndex];
  }
  const voters: ChoiceNode['voters'] = {};
  for (const userSessionId of Object.keys(choiceNodeRaw.votes)) {
    const userId = choiceNodeRaw.uidUser[userSessionId] as UUID | undefined;
    if (userId) {
      voters[userSessionId] = {
        userSessionId,
        userId
      };
    } else {
      voters[userSessionId] = {
        userSessionId
      };
    }
  }

  return {
    id: choiceNodeRaw._id,
    timeCreated: new Date(choiceNodeRaw.ct),
    timeUpdated: new Date(choiceNodeRaw.ut),
    users: processUsers(choiceNodeRaw.u),

    active: choiceNodeRaw.closed !== 'closed',
    autoCloseDate: choiceNodeRaw.autoClose ? new Date(parseInt(choiceNodeRaw.autoClose, 10)) : undefined,
    choiceReplyCount,
    choices,
    custom: !!choiceNodeRaw.custom,
    description: choiceNodeRaw.b || '',
    fanclubExclusive: !!choiceNodeRaw.fanclubExclusive,
    lastReply: choiceNodeRaw.lr ? processChatNode(choiceNodeRaw.lr) : null,
    multiple: !!choiceNodeRaw.multiple,
    nodeType: 'choice',
    storyNodeId: choiceNodeRaw.sid,
    votes: choiceNodeRaw.votes,
    voters,
  };
}
