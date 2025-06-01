class RootFolder {
  id: string;
  name: string;
}

class Folder {
  id: string;
  name: string;
}

class PredefinedEventDetail {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

class PredefinedEvent {
  predefinedEvent: PredefinedEventDetail;
  courseId: string;
  predefinedEventId: string;
}

export class CoursesFindAllResponseItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  rootFolder: RootFolder;
  folders: Folder[];
  predefinedEvents: PredefinedEvent[];
}
