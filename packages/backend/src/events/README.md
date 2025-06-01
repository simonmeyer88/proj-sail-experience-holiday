## Events module

An event can be understood as:

- Something that managers can post to "the calendar" (with a start and end and a title and a description, and available slots) for either a collection of courses, or the club.
- Something that students can sign up for, as long as there are slots, and they are in one of the courses that the event is for, or they are in the club and the event is for the club.
- Something that students are expected to complete throughout the course duration.

More on that:

- Club events are for students that are on the club. They are independent.
- Course events are for students that are on a course:
  - Each course has certain events that students must do. They are called "predefined events". They are created by the admin.
    For example, courseX needs to do "predefinedEvent1", "predefinedEvent2", and "predefinedEvent3".

Each time a **course** event is published to the calendar, it is associated with certain predefined event. When students enroll in that event and it finishes, it is marked as completed for that student.

Students can see their left events (tasks). Admins can also manually mark as completed/uncompleted.

Once a task is marked completed, it is marked as completed for that student, and the student can't enroll in it again.

As for club events, they are also marked as completed and stuff, but they do not have any limit and they do not represent requirements for the students.
