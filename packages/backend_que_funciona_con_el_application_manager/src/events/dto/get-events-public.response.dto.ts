// Just so we dont require the whole event to construct the response dto
interface _Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  totalSlots: number;
  users: any[];
  waitlist: any[];
  description: string;
  color?: string;
  enableBooking: boolean;
}
export class GetEventsPublicResponseDto {
  constructor(event: _Event) {
    this.id = event.id;
    this.title = event.title;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.freeSlots = event.totalSlots - event.users.length;
    this.description = event.description;
    this.color = event.color;
    this.enableBooking = event.enableBooking;
  }
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  freeSlots: number;
  description: string;
  color?: string;
  enableBooking: boolean;
}
