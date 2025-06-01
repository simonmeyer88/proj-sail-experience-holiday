export class QuizRandomQuestionsResponse {
  questions: QuizRandomQuestionsResponseQuestion[];
}

export class QuizRandomQuestionsResponseQuestion {
  answers: QuizRandomQuestionsResponseQuestionAnswer[];
}

export class QuizRandomQuestionsResponseQuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: Date;
  updatedAt: Date;
}
