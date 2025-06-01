export class EventCreatedEvent {
  /**
   * Creates a new instance of the EventCreatedEvent class.
   * @param eventId - The ID of the event.
   */
  constructor(public readonly eventId: string) {}
}
