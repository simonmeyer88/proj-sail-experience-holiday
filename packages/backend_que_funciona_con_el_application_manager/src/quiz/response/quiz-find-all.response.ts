/*const quizzes: {
    courses: (GetResult<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }, unknown> & {})[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    nQuestionsPerAttempt: number;
}[]*/

export class QuizFindAllResponse {
  courses: QuizFindAllResponseCourse[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  nQuestionsPerAttempt: number;
}

export class QuizFindAllResponseCourse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
