export class QuizFindOneResponse {
  questions: QuizFindOneResponseQuestion[];
}

export class QuizFindOneResponseQuestion {
  answers: QuizFindOneResponseQuestionAnswer[];
}

export class QuizFindOneResponseQuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: Date;
  updatedAt: Date;
}
