export interface ZoomBody {
  event:
    | 'meeting.created'
    | 'meeting.deleted'
    | 'meeting.ended'
    | 'endpoint.url_validation';
}

export interface ZoomBodyUrlValidation extends ZoomBody {
  event: 'endpoint.url_validation';
  payload: {
    plainToken: string;
  };
}
export interface ZoomBodyMeetingCreated extends ZoomBody {
  event: 'meeting.created';
  payload: {
    object: {
      id: string;
      join_url: string;
    };
  };
}

// treat meeting.ended and meeting.deleted the same
export interface ZoomBodyMeetingDeleted extends ZoomBody {
  event: 'meeting.deleted' | 'meeting.ended';
  payload: {
    object: {
      id: string;
    };
  };
}
