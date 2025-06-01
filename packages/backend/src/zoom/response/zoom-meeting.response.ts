import { ZoomMeeting } from '@prisma/client';

/**
 * This class implements the ZoomMeeting interface from the Prisma client.
 * It represents a response containing details about a Zoom meeting.
 */
export class ZoomMeetingResponse implements ZoomMeeting {
  id: string; // The unique identifier for the meeting
  meetingId: string; // The meeting's ID on Zoom
  joinUrl: string; // The URL to join the meeting. Includes the password if the meeting is password protected
  createdAt: Date; // The date and time when the meeting was created
  updatedAt: Date; // The date and time when the meeting was last updated
}
