import {User} from "../types/User";
import {UserRaw} from "../types/UserRaw";
import {processUser} from "./processUser";

export function processUsers(usersRaw: string | UserRaw[] | undefined): User[] {
  if (typeof usersRaw === 'string') {
    return [processUser({n: usersRaw})];
  }
  if (Array.isArray(usersRaw)) {
    return usersRaw.map(processUser);
  }
  return [];
}
