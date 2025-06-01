export class VideosFindAllResponseItem {
  courses: CourseItem[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  title: string;
  date: Date;
}
class CourseItem {
  id: string;
  name: string;
}
