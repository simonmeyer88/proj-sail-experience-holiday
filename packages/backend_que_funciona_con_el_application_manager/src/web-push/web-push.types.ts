export type WebPushEventType = 'chat' | 'calendar';

export interface IWebPushEvent {
  title: string;
  type: WebPushEventType;
  data: Record<string, unknown>;
  body: string;
}

export enum WebPushSubscriptionType {
  CHAT = 'CHAT',
  CALENDAR = 'CALENDAR',
}
