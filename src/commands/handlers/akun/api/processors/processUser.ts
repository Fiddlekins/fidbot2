import {imageURLParser} from "../../utils/imageURLParser";
import {User} from "../types/User";
import {UserRaw} from "../types/UserRaw";

export function processUser(userRaw: UserRaw): User {
  const user: User = {
    id: userRaw._id,
    username: userRaw.n,
  }
  const avatar = imageURLParser(userRaw.a);
  if (avatar) {
    user.avatar = avatar;
  }
  return user;
}
