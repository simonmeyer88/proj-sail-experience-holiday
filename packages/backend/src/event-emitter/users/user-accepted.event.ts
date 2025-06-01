/**
 * Represents a user accepted event.
 */
export class UserAcceptedEvent {
  /**
   * Creates a new instance of the UserAcceptedEvent class.
   * @param userId - The ID of the user.
   * @param fullName - The full name of the user.
   * @param email - The email of the user.
   */
  constructor(
    public readonly userId: string,
    public readonly fullName: string,
    public readonly email: string,
  ) {}
}
