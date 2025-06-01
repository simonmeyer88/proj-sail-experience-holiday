/**
 * Represents a user onboarded event.
 */
export class UserOnboardedEvent {
  /**
   * Creates a new instance of the UserOnboardedEvent class.
   * @param userId - The ID of the user.
   * @param fullName - The full name of the user.
   */
  constructor(
    public readonly userId: string,
    public readonly fullName: string,
  ) {}
}
