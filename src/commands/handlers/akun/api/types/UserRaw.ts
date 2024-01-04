import {UUID} from "./ids";

export interface UserRaw {
  /**
   * Unique ID of the user
   * Absent if the user is anon
   */
  _id?: UUID;

  /**
   * Avatar image URL
   */
  a?: string;

  /**
   * Username
   */
  n: string;
}
