/**
 * Represents a new message event.
 */
export class NewMessageEvent {
  /**
   * Creates a new instance of the NewMessageEvent class.
   * @param messageId - The ID of the message.
   */
  constructor(public messageId: string) {}
}
