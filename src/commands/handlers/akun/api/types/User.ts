export interface User {
  /**
   * Unique ID of the user
   * Absent if the user is anon
   */
  id?: string;

  /**
   * Avatar image URL
   */
  avatar?: string;

  /**
   * Username
   */
  username: string;
}
