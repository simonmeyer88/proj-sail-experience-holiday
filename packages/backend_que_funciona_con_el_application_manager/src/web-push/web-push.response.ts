export class WebPushResponse {
  constructor(
    public readonly chatEnabled: boolean,
    public readonly calendarEnabled: boolean,
  ) {}
}
